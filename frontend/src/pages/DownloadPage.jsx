import React, { useState } from 'react';
import '../styles.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * formatBytes
 * 
 * Used to translate # of bytes of file into appropriate format [size] [B,KB,MB...]
 * 
 * @param {int} bytes - Total number of bytes a file is.
 * @returns {string} String format of number of units and unit type.
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const sizeUnits = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, index)).toFixed(2);
  return `${size} ${sizeUnits[index]}`
}

/**
 * DownloadPage
 * 
 * Houses the logic needed for DownloadPage.jsx.
 * Being handleVerify & handleDownload.
 * 
 * @returns  {javascript} - logic and layout of the page.
 */
const DownloadPage = () => {
  const [hash, setHash] = useState('');
  const [fileInfo, setFileInfo] = useState(null);

  /**
   * handleVerify
   * 
   * Handles the verification that a particular hash (file) exists in the DB.
   * 
   * @param {Event} e - Click event triggered by verify button
   * @returns {void}
   */
  const handleVerify = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/check_hash/${hash}`);
      const data = await response.json();
      if (response.ok) {
        setFileInfo(data);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to verify hash");
    }
  };

  /**
   * handleDownload
   * 
   * Handles the downloading of a particular hash(file) from AWS S3 bucket.
   * 
   * @param {Event} e - Click event triggered by download button
   * 
   */
  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/download/${hash}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();
        
        // Create a temporary URL for the file
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = fileInfo.filename
        link.click();  // Trigger the download
        
        // Cleanup
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('There was an error downloading the file.');
    }
  };

  return (
    <div style={{
      backgroundColor: "#212121",
      color: "#fff",
      minHeight: "100vh",
      fontFamily: "sans-serif",
      padding: "40px",
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
        marginTop: 60,
        maxWidth: "700px",
        width: "100%",
        backgroundColor: "#2a2a2a",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)"
      }}>
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "bold", 
          marginBottom: "1.5rem",
          textAlign: "center" 
        }}>Download File</h1>
        
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="Enter file hash"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #444",
            backgroundColor: "#333",
            color: "#fff",
            marginBottom: "16px"
          }}
        />
        
        <button
          onClick={handleVerify}
          style={{
            backgroundColor: "#2196F3",         
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            width: "100%",
            fontSize: "1rem",
            color: "#fff",
            transition: "background-color 0.3s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0d8bf2"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#2196F3"}
        >
          Verify
        </button>
  
        {fileInfo && (
          <div style={{
            backgroundColor: "#333",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "24px"
          }}>
            <p style={{ marginBottom: "8px" }}><strong>Filename:</strong> {fileInfo.filename}</p>
            <p style={{ marginBottom: "8px" }}><strong>Uploaded at:</strong> {fileInfo.uploaded_at}</p>
            <p style={{ marginBottom: "16px" }}><strong>Size:</strong> {formatBytes(fileInfo.file_size)}</p>
            
            <button
              onClick={handleDownload}
              style={{
                backgroundColor: "#4CAF50",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%",
                fontSize: "1rem",
                color: "#fff",
                transition: "background-color 0.3s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#43a047"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );


};

export default DownloadPage;
