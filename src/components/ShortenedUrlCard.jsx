import React from 'react';
import { Card, CardContent, Typography, Link, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { logFrontendEvent } from '../utils/logger';

function ShortenedUrlCard({ urlData }) {
  const expiryDate = new Date(urlData.expiryDate);
  const formattedExpiry = expiryDate.toLocaleString();

  const handleCopy = () => {
    navigator.clipboard.writeText(urlData.shortUrl);
    alert('Short URL copied to clipboard!');
    logFrontendEvent('UI_ACTION_COPY_SHORT_URL', { shortUrl: urlData.shortUrl });
  };

  const handleShortUrlClick = () => {
    // Redirection is handled by the App.jsx's useEffect for dynamic routes
    logFrontendEvent('UI_ACTION_SHORT_URL_CLICKED_FROM_CARD', { shortUrl: urlData.shortUrl });
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Original URL:
        </Typography>
        <Link href={urlData.originalUrl} target="_blank" rel="noopener noreferrer" variant="body1">
          {urlData.originalUrl}
        </Link>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Short URL:
        </Typography>
        <Box display="flex" alignItems="center">
          <Link
            href={urlData.shortUrl} // This link will trigger the route in App.jsx
            target="_blank" // Open in new tab, but still handled by client-side router
            rel="noopener noreferrer"
            variant="h6"
            sx={{ mr: 1, textDecoration: 'none' }}
            onClick={handleShortUrlClick}
          >
            {urlData.shortUrl}
          </Link>
          <ContentCopyIcon
            sx={{ cursor: 'pointer', fontSize: '1rem' }}
            onClick={handleCopy}
            titleAccess="Copy to clipboard"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Expires On: {formattedExpiry}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Creation Date: {new Date(urlData.creationDate).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ShortenedUrlCard;