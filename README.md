# 📂 File Throw

File Throw is a minimalist, privacy-focused file sharing web application where users can upload files, generate a one-time hash-based download link, and share it securely. Files are burned (deleted) after download.

---

## 🚀 Features

- 🔐 One-time file download hashes             
- 📦 Files are stored securely via AWS S3
- 🧊 Optional password protection (encrypted)
- 📁 Frontend in React.js + Vite
- 🔧 Backend in Flask (Python)

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- CSS
- Vite

**Backend:**
- Flask (Python)
- Flask-CORS
- Boto3 (AWS SDK for Python)
- PostgreSQL

**Cloud:**
- AWS S3 (for file storage)

---

## 🧑🏻‍💻 Installation

### Backend Setup
```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask run
```

### Frontend Setup
```
cd frontend
sudo apt install npm
npm install react react-dom react-router-dom vite axios
```
