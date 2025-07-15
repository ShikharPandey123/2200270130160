import { useState, useEffect } from 'react';
import { mockLogin, mockLogout } from '../utils/api'; // Assuming these are in your api.js

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check localStorage for a logged-in state on mount
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(storedLoginStatus === 'true');
  }, []);

  const login = async () => {
    // In a real app, this would involve calling your actual login API
    const success = await mockLogin();
    if (success) {
      setIsLoggedIn(true);
      // localStorage.setItem('isLoggedIn', 'true'); // mockLogin/Logout already handles this for demo
    }
    return success;
  };

  const logout = async () => {
    // In a real app, this would involve calling your actual logout API
    const success = await mockLogout();
    if (success) {
      setIsLoggedIn(false);
      // localStorage.removeItem('isLoggedIn'); // mockLogin/Logout already handles this for demo
    }
    return success;
  };

  return { isLoggedIn, login, logout };
};

export default useAuth;