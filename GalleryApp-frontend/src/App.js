import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ImageUpload from "./components/ImageUpload";
import ImageGallery from "./components/ImageGallery";
import Login from "./components/LoginForm";
import Signup from "./components/SignupForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [images, setImages] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchImages();
    }
  }, [isAuthenticated]);

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        `http://34.234.86.182:8080/api/images/list?userId=${userId}`
      );
      const data = response.data;
      setImages(data.map((url) => ({ url })));
    } catch (error) {
      toast.error("Error fetching images");
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    try {
      const response = await axios.post(
        "http://34.234.86.182:8080/api/images/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchImages();
      toast.success("Image uploaded successfully");
      return response;
    } catch (error) {
      toast.error("Error uploading image");
    }
  };

  const handleLogin = (user) => {
    console.log("User object received:", user);
    setUserId(user.id);
    setUserEmail(user.email);
    setIsAuthenticated(true);
    toast.success("Logged in successfully");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      setUserId(null);
      setUserEmail("");
      setIsAuthenticated(false);
      toast.info("Logged out successfully");
    }
  };

  const handleDelete = () => {
    fetchImages();
  };

 return (
    <>
      <Router>
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="absolute top-0 right-0 m-4">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-8">Explore Our Photo Gallery</h1>
          <p className="text-muted-foreground md:text-lg">
            Discover a curated collection of stunning photographs.
          </p>
          <ToastContainer />
          {!isAuthenticated ? (
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          ) : (
            <Routes>
              <Route
                path="/gallery"
                element={
                  <div>
                    <ImageUpload
                      onUpload={handleUpload}
                      userEmail={userEmail}
                    />
                    <ImageGallery images={images} onDelete={handleDelete} />
                  </div>
                }
              />
              <Route path="*" element={<Navigate to="/gallery" />} />
            </Routes>
          )}
        </div>
      </Router>
    </>
  );
}

export default App;
