// src/Login.js
import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from './firebase'; // ✅ clean import

function Login({ setUser }) {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user); // Send user info up to App
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-screen">
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
}

export default Login;
