import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert, CircularProgress, Grid } from '@mui/material';
import ShortenedUrlCard from '../components/ShortenedUrlCard';
import { logFrontendEvent } from '../utils/logger';

function HomePage({ onShorten }) {
  const [urlsToShorten, setUrlsToShorten] = useState([{ id: 1, longUrl: '', validity: '', customShortcode: '' }]);
  const [shortenedResults, setShortenedResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addUrlField = () => {
    if (urlsToShorten.length < 5) {
      setUrlsToShorten([...urlsToShorten, { id: urlsToShorten.length + 1, longUrl: '', validity: '', customShortcode: '' }]);
      logFrontendEvent('UI_ACTION_ADD_URL_FIELD');
    } else {
      setError("You can only shorten up to 5 URLs concurrently.");
    }
  };

  const handleInputChange = (id, field, value) => {
    setUrlsToShorten(prevUrls =>
      prevUrls.map(url => (url.id === id ? { ...url, [field]: value } : url))
    );
  };

  const validateInput = (longUrl, validity, customShortcode) => {
    setError(null);
    if (!longUrl) {
      return "URL cannot be empty.";
    }
    try {
      new URL(longUrl); // Basic URL format check
    } catch (e) {
      return "Invalid URL format. Please include http:// or https://";
    }
    if (validity !== '' && (isNaN(parseInt(validity)) || parseInt(validity) <= 0)) {
      return "Validity period must be a positive integer in minutes.";
    }
    if (customShortcode && !/^[a-zA-Z0-9_-]{3,20}$/.test(customShortcode)) {
      return "Custom shortcode must be alphanumeric (a-z, A-Z, 0-9, -, _) and between 3-20 characters.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShortenedResults([]);
    setError(null);
    logFrontendEvent('UI_ACTION_SHORTEN_BUTTON_CLICKED', { numberOfUrls: urlsToShorten.length });

    const newResults = [];
    let hasError = false;

    for (const urlData of urlsToShorten) {
      const validationError = validateInput(urlData.longUrl, urlData.validity, urlData.customShortcode);
      if (validationError) {
        setError(validationError);
        hasError = true;
        logFrontendEvent('CLIENT_SIDE_VALIDATION_ERROR', { urlData, error: validationError });
        break; // Stop processing if validation fails for any
      }

      try {
        const result = await onShorten(urlData.longUrl, parseInt(urlData.validity) || 30, urlData.customShortcode);
        if (result) {
          newResults.push(result);
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred during shortening.");
        hasError = true;
        break; // Stop processing on API error
      }
    }

    if (!hasError) {
      setShortenedResults(newResults);
      setUrlsToShorten([{ id: 1, longUrl: '', validity: '', customShortcode: '' }]); // Reset form
      logFrontendEvent('SHORTENING_PROCESS_COMPLETED', { success: true, count: newResults.length });
    } else {
      logFrontendEvent('SHORTENING_PROCESS_COMPLETED', { success: false, error: error });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {urlsToShorten.map((url, index) => (
            <Grid item xs={12} key={url.id}>
              <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>URL #{index + 1}</Typography>
                <TextField
                  fullWidth
                  label="Original Long URL"
                  variant="outlined"
                  value={url.longUrl}
                  onChange={(e) => handleInputChange(url.id, 'longUrl', e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Validity Period (minutes, optional, default 30)"
                  variant="outlined"
                  type="number"
                  value={url.validity}
                  onChange={(e) => handleInputChange(url.id, 'validity', e.target.value)}
                  margin="normal"
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth
                  label="Custom Shortcode (optional)"
                  variant="outlined"
                  value={url.customShortcode}
                  onChange={(e) => handleInputChange(url.id, 'customShortcode', e.target.value)}
                  margin="normal"
                  helperText="Alphanumeric, hyphens, and underscores (3-20 chars)"
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            onClick={addUrlField}
            disabled={urlsToShorten.length >= 5 || loading}
          >
            Add Another URL ({urlsToShorten.length}/5)
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Shortening...' : 'Shorten URLs'}
          </Button>
        </Box>
      </form>

      {shortenedResults.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Shortened URLs:
          </Typography>
          <Grid container spacing={2}>
            {shortenedResults.map((result) => (
              <Grid item xs={12} md={6} key={result.id}>
                <ShortenedUrlCard urlData={result} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default HomePage;