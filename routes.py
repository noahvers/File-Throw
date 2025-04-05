import os
import hashlib
import tempfile
import boto3
import io
import base64
from flask import Blueprint, request, jsonify, send_file, redirect
from models import db, FileUpload
# from util import upload_file_to_s3, delete_file_from_s3
from werkzeug.utils import secure_filename
from io import BytesIO


file_routes = Blueprint("file_routes", __name__)

s3 = boto3.client(
    "s3",
    aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY"),
)

BUCKET = os.getenv("AWS_BUCKET_NAME")

def generate_file_hash(filename, content_bytes):
    hasher = hashlib.sha256()
    hasher.update(filename.encode())
    hasher.update(content_bytes)

    return base64.urlsafe_b64encode(hasher.digest())[:16].decode()

@file_routes.route("/upload", methods=["POST"])
def upload_file():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    
    filename = secure_filename(file.filename)
    file_bytes = file.read()
    file_size = len(file_bytes)

    hash_name = generate_file_hash(filename, file_bytes)
    s3_key = hash_name

    s3.upload_fileobj(BytesIO(file_bytes), BUCKET, s3_key)

    file_url = f"https://{BUCKET}.s3.amazonaws.com/{s3_key}"

    new_file = FileUpload(
        filename = filename,
        file_url = file_url,
        file_size = file_size,
    )

    db.session.add(new_file)
    db.session.commit()

    return jsonify({"file_url": file_url, "hash": hash_name})

@file_routes.route("/api/files/<hash_name>", methods=["GET"])
def get_file_metadata(hash_name):
    file_url = f"https://{BUCKET}.s3.amazonaws.com/{hash_name}"
    file = FileUpload.query.filter_by(file_url=file_url).first()

    if not file:
        return jsonify({"error": "File not found"}), 404

    return jsonify({
    "filename": file.filename,
    "file_url": file.file_url,
    "uploaded_at": file.uploaded_at,
    "filesize": file.file_size,

})    

@file_routes.route("/download/<hash_name>", methods=["GET"])
def download_file(hash_name):
    file_url = f"https://{BUCKET}.s3.amazonaws.com/{hash_name}"
    file = FileUpload.query.filter_by(file_url=file_url).first()

    if not file:
        return jsonify({"error": "File not found"}), 404
#    if file.downloaded:
#        return jsonify({"error": "File already downloaded"}), 403
    # Get file content from S3

    try:
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params = {
                'Bucket': BUCKET,
                'Key': hash_name,
                'ResponseContentDisposition': f'attachment; filename="{file.filename}"'
            },
            ExpiresIn=3600
        )
        return redirect(presigned_url)

    except Exception as e:
        return jsonify({"error": f"Error fetching file: {str(e)}"}), 500
    
    # Mark file as downloaded
    file.downloaded = True
    db.session.commit

    # Delete file from S3
#    try:
#        s3.delete_object(Bucket=BUCKET, Key=hash_name)
#    except Exception as e:
#        return jsonify({"error": "File downloaded, but deletion failed"}), 500

