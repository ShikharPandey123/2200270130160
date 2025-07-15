import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StatisticsPage from './pages/StatisticsPage';
import Header from './components/Header';
import { Container, Box } from '@mui/material';
import { shortenUrl, getShortenedUrls, getClickDetails, mockLogin, mockLogout } from './utils/api'; 
import { logFrontendEvent } from './utils/logger';
import useAuth from './hooks/useAuth';



function App() {
  const navigate = useNavigate();
  const { isLoggedIn, login, logout } = useAuth();
  const [urls, setUrls] = useState([]); // State to store all URLs, simulating persistence

  // Load URLs from localStorage on initial render (simulating backend data)
  useEffect(() => {
    const storedUrls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
    setUrls(storedUrls);

    // Log frontend app start event
    logFrontendEvent('info', 'page', 'Application started', { timestamp: new Date().toISOString() });
   }, []);

  // Function to handle URL shortening (will be passed to HomePage)
  const handleShorten = async (longUrl, validityMinutes, customShortcode) => {
    try {
      const result = await shortenUrl(longUrl, validityMinutes, customShortcode, urls); // Pass current URLs for uniqueness check
      if (result) {
        const updatedUrls = [...urls, result];
        setUrls(updatedUrls);
        localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls)); // Persist locally

        logFrontendEvent('info', 'api', 'URL shortened successfully', {
          originalUrl: longUrl,
          shortUrl: result.shortUrl,
          customShortcodeUsed: !!customShortcode,
        });
        return result; // Return the new shortened URL object
      }
      return null;
    } catch (error) {
      logFrontendEvent('error', 'api', 'URL shortening failed', {
        originalUrl: longUrl,
        customShortcode: customShortcode,
        error: error.message,
      });
      throw error; // Re-throw to be handled by the form component
    }
  };

  // Function to handle redirection
  const handleRedirect = async (shortcode) => {
    // Find the original URL
    const urlMapping = urls.find(u => u.shortCode === shortcode);

    if (urlMapping) {
      // Simulate backend click logging
      const updatedUrls = urls.map(u => {
        if (u.shortCode === shortcode) {
          const clickData = {
            timestamp: new Date().toISOString(),
            source: document.referrer || 'direct', // Basic source detection
            // In a real app, you'd get coarse-grained geo location from backend/IP
            geo: 'Unknown Location (Frontend Sim)',
          };
          const newClickCount = (u.clicks?.total || 0) + 1;
          const newClickDetails = [...(u.clicks?.details || []), clickData];

          // Update the URL object with new click data
          const updatedUrl = {
            ...u,
            clicks: {
              total: newClickCount,
              details: newClickDetails,
            },
          };

          logFrontendEvent('info', 'page', 'Short URL clicked and redirected', {
             shortUrl: urlMapping.shortUrl,
            // shortUrl: urlMapping.s hortUrl,
            originalUrl: urlMapping.originalUrl,
            clickDetails: clickData,
          });

          return updatedUrl;
        }
        return u;
      });
      setUrls(updatedUrls);
      localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls)); // Update localStorage

      // Perform redirection
      window.location.href = urlMapping.originalUrl;
    } else {
      logFrontendEvent('warn', 'page', 'Short URL not found for redirection', { shortcode });
      navigate('/not-found'); // Or display an error page
    }
  };


  // Effect to handle dynamic shortcode routes
  useEffect(() => {
    const path = window.location.pathname;
    const shortcodeMatch = path.match(/^\/([a-zA-Z0-9_-]+)$/);
    if (shortcodeMatch) {
      const shortcode = shortcodeMatch[1];
      // Check if this is a known shortcode and perform redirection
      const isShortcodeHandled = urls.some(u => u.shortCode === shortcode);
      if (isShortcodeHandled) {
        handleRedirect(shortcode);
      }
      // If it's not a known shortcode, let React Router handle other routes or 404
    }
  }, [urls, navigate]); // Re-run if `urls` change

  // Simulating user "login" to fetch past URLs.
  const handleLogin = async () => {
    await login(); // Calls mockLogin internally
    // After login, you'd typically fetch user-specific URLs from your backend
    const userUrls = JSON.parse(localStorage.getItem('shortenedUrls')) || []; // For this demo, all local URLs are "user's"
    setUrls(userUrls);
    logFrontendEvent('info', 'auth', 'User logged in', { userId: 'simulatedUser' });
    navigate('/statistics'); // Redirect to statistics page after login
  };

  const handleLogout = async () => {
    await logout(); // Calls mockLogout internally
    setUrls([]); // Clear URLs on logout (or filter to public ones if applicable)
    logFrontendEvent('info', 'auth', 'User logged out', { userId: 'simulatedUser' });
    navigate('/'); // Redirect to home page after logout
  };


  return (
    <Container maxWidth="md">
      <Header
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <Box sx={{ my: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage onShorten={handleShorten} />} />
          <Route
            path="/statistics"
            element={isLoggedIn ? <StatisticsPage urls={urls} /> : <div>Please log in to view statistics.</div>}
          />
          {/* Dynamic route for shortcode redirection - handled by useEffect above */}
          <Route path="/:shortcode" element={null} /> {/* This route will be caught by useEffect for redirection */}
          <Route path="*" element={<div>404 - Not Found</div>} /> {/* Catch-all for unknown routes */}
        </Routes>
      </Box>
    </Container>
  );
}

export default App;

//okay do your thing