import React, { useState } from 'react';
import '../styles.css';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setHash(data.hash);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      padding: 40,
      backgroundColor: "#212121",
      color: "#fff",
      minHeight: "100vh",
      fontFamily: 'sans-serif',
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h1 style={{
        fontStyle: "italic",
        position: "absolute",
        top: 20,
        left: 20,
        margin: 0,
        fontSize: "1.5rem",
        fontWeight: "normal"
      }}>File Throw</h1>
      
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
        maxWidth: "700px",
        width: "100%",
        backgroundColor: "#2a2a2a",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)"
      }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Upload Your File</h2>
        
        <p style={{
          marginBottom: "2rem",
          maxWidth: "500px",
          textAlign: "center",
          color: "#e0e0e0"
        }}>
          Choose a file to upload. After uploading, you'll receive a unique hash that can be used to download the file.
        </p>
        
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            backgroundColor: "#333",
            color: "#fff",
            padding: "10px",
            borderRadius: "4px",
            width: "300px",
            marginBottom: "1rem"
          }}
        />
        
        <button
          onClick={handleUpload}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0d8bf2"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#2196F3"}
        >
          Upload
        </button>
         {hash && (
          <div style={{ 
            marginTop: 30, 
            textAlign: "center",
            width: "100%",
            backgroundColor: "#333",
            padding: "20px",
            borderRadius: "8px"
          }}>
            <p style={{ marginBottom: "1rem" }}><strong>Hash:</strong> {hash}</p>
            <button
              onClick={copyToClipboard}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background-color 0.3s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#43a047"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default UploadPage;
