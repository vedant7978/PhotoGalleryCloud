import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import './ImageUpload.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const ImageUpload = ({ onUpload, userEmail }) => {
  console.log('Received userEmail in ImageUpload:', userEmail); // Check if email is available

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleUpload = async () => {
    if (file) {
      try {
        const response = await onUpload(file);
        const imageUrl = response.data;
        setFileName('');
        toast.success('Image uploaded successfully');
        console.log('User email:', userEmail); 
        await sendNotification(userEmail, imageUrl);
      } catch (error) {
        toast.error('Error uploading image');
      }
    } else {
      toast.error('No file selected');
    }
  };

  const sendNotification = async (email, imageUrl) => {
    console.log('Sending notification with email:', email); // Check email value
    console.log(imageUrl);
    try {
      const response = await axios.post("https://39qw26u691.execute-api.us-east-1.amazonaws.com/Prod/notifyuploaduser", {
        email: email , // Fallback to a default email if necessary
        imageUrl: imageUrl
      });
      if (response.status === 200) {
        toast.success('Notification sent successfully');
      } else {
        toast.error('Error sending notification');
      }
    } catch (error) {
      toast.error('Error sending notification');
    }
  };

  return (
    <div className="upload-container">
      <input type="file" id="fileInput" onChange={handleFileChange} hidden />
      <label htmlFor="fileInput" className="upload-label">
        <FaUpload size={24} />
        <span>Choose a file</span>
      </label>
      {fileName && (
        <div className="file-name">
          <span>{fileName}</span>
        </div>
      )}
      <button onClick={handleUpload} className="upload-button">Upload Image</button>
    </div>
  );
};

export default ImageUpload;
