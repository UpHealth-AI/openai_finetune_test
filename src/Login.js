// src/Login.js
import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from './firebase';

function Login({ setUser }) {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);
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
