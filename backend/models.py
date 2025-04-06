from flask_sqlalchemy import SQLAlchemy
import uuid

db = SQLAlchemy()

class FileUpload(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    filename = db.Column(db.String(255), nullable = False)
    file_url = db.Column(db.String(255), nullable = False, unique = True)
    uploaded_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    downloaded = db.Column(db.Boolean, default = False)
    file_size = db.Column(db.Integer, nullable = False)

    def to_dict(self):
        return f"<FileUpload {self.filename}>"