import React, { useState } from 'react';
import './ImageGallery.css';
import axios from 'axios';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const ImageGallery = ({ images, onDelete }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDetails, setImageDetails] = useState({});
  const [largeImageIsOpen, setLargeImageIsOpen] = useState(false);

  const fetchImageDetails = async (image) => {
    try {
      const key = image.url;
      const imageUrl = { key };
      const response = await axios.post(`https://39qw26u691.execute-api.us-east-1.amazonaws.com/Prod/getImageDetails`,imageUrl);
      const parsedBody = JSON.parse(response.data.body);
      const formattedDate = new Date(parsedBody.lastModified).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setImageDetails({
        url: parsedBody.url,
        contentType: parsedBody.contentType,
        contentLength: parsedBody.contentLengthMB,
        lastModified: formattedDate,
      });
      setSelectedImage(image);
      setModalIsOpen(true);
    } catch (error) {
      toast.error('Error fetching image details');
    }
  };

  const confirmDelete = async () => {
    try {
      console.log(selectedImage.url)
      await axios.post(`https://39qw26u691.execute-api.us-east-1.amazonaws.com/Prod/deleteImageDetails`,{imageUrl:selectedImage.url});
      onDelete();
      setConfirmationIsOpen(false);
      setModalIsOpen(false);
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Error deleting image');
    }
  };

  return (
    <div className="gallery-container">
      {images.map((image, index) => (
        <div key={index} className="gallery-card">
          <img
            src={image.url}
            alt={`Image ${index}`}
            className="gallery-image"
            onClick={() => fetchImageDetails(image)}
          />
          <div className="hover-message">Click on image to see more details</div>
        </div>
      ))}
      {selectedImage && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Image Details"
          className="modal"
          overlayClassName="overlay"
        >
        <button className="close-button" onClick={() => setModalIsOpen(false)}>&times;</button>
          <div className="modal-content">
            <img
              src={imageDetails.url}
              alt="Selected"
              className="modal-image"
              onClick={() => setLargeImageIsOpen(true)}
            />
            <div className="image-details">
              <p>URL: {imageDetails.url}</p>
              <p>Content Type: {imageDetails.contentType}</p>
              <p>Size: {imageDetails.contentLength} Mb</p>
              <p>Upload On: {imageDetails.lastModified}</p>
              <button className="delete-button" onClick={() => setConfirmationIsOpen(true)}>Delete</button>
            </div>
          </div>
          {confirmationIsOpen && (
            <div className="confirmation-overlay">
              <div className="confirmation-dialog">
                <p>Are you sure you want to delete this image?</p>
                <button className="confirm-button" onClick={confirmDelete}>Yes</button>
                <button className="cancel-button" onClick={() => setConfirmationIsOpen(false)}>No</button>
              </div>
            </div>
          )}
        </Modal>
      )}
      {selectedImage && (
        <Modal
          isOpen={largeImageIsOpen}
          onRequestClose={() => setLargeImageIsOpen(false)}
          contentLabel="Large Image"
          className="large-image-modal"
          overlayClassName="overlay"
        >
          <div className="large-image-container">
            <button className="close-button" onClick={() => setLargeImageIsOpen(false)}>&times;</button>
            <img
              src={imageDetails.url}
              alt="Large Selected"
              className="large-image"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageGallery;
