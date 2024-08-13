import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault(); 

    if (username.trim() === '' || password.trim() === '' || name.trim() === '' || email.trim() === '') {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await axios.post('http://34.234.86.182:8080/api/auth/register', {
        username,
        password,
        name,
        email,
      });
      
      console.log(response + '--------------------------------');
      
      const notifyResponse = await axios.post('https://39qw26u691.execute-api.us-east-1.amazonaws.com/Prod/notifyuser', {
        email,
      });

      console.log(notifyResponse);
      toast.success('Signup successful! You can now log in.');
    } catch (error) {
      console.error(error);
      toast.error('Error signing up. Please try again.');
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <form className="mt-8 space-y-6" onSubmit={handleSignup}>
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
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Signup
        </button>
      </form>

      <div className="text-center mt-4">
        <Link to="/login" className="text-blue-500 hover:underline">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
};

export default Signup;
