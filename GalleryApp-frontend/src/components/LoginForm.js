import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim() === '' || password.trim() === '') {
        toast.error('Please fill in all fields.');
        return;
      }
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long.');
        return;
      }
    try {
      const response = await axios.post('http://34.234.86.182:8080/api/auth/login', {
        username,
        password,
      });
      console.log(response);
      const { id, email } = response.data; // Ensure response includes email
      onLogin({ id, email });
    } catch (error) {
        toast.error('Error logging in. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>

      <div className="text-center mt-4">
        <Link to="/signup" className="text-blue-500 hover:underline">
          Don't have an account? Sign up
        </Link>
      </div>
      
    </div>
  );
}

export default Login;
