import os
import hashlib
import boto3
import base64
from flask import Blueprint, request, jsonify, send_file
from models import db, FileUpload
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

    return jsonify({"hash": hash_name})

@file_routes.route("/api/check_hash/<hash_name>", methods=["GET"])
def check_file(hash_name):
    file_url = f"https://{BUCKET}.s3.amazonaws.com/{hash_name}"
    file = FileUpload.query.filter_by(file_url=file_url).first()

    if not file:
        return jsonify({"error": "File not found"}), 404

    return jsonify({
    "filename": file.filename,
    "uploaded_at": file.uploaded_at,
    "file_size": file.file_size,

})    

@file_routes.route("/api/download/<hash_name>", methods=["GET"])
def download_file(hash_name):
    try:
        file_url = f"https://{BUCKET}.s3.amazonaws.com/{hash_name}"
        file = FileUpload.query.filter_by(file_url=file_url).first()
        
        s3_object = s3.get_object(Bucket=BUCKET, Key=hash_name)
        file_content = s3_object['Body'].read()
        
        # Convert the file content into a BytesIO object
        file_stream = BytesIO(file_content)
        
        # Send the file
        return send_file(file_stream, as_attachment=True, download_name=file.filename)
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Error fetching file"}), 500