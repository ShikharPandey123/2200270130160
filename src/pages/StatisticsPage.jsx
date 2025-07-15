import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { logFrontendEvent } from '../utils/logger';

// Row component for collapsible click details
function Row(props) {
  const { url } = props;
  const [open, setOpen] = useState(false);

  const handleShortUrlClick = () => {
    // Redirection is handled by the App.jsx's useEffect for dynamic routes
    logFrontendEvent('UI_ACTION_SHORT_URL_CLICKED_FROM_STATS', { shortUrl: url.shortUrl });
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              visibility: url.clicks?.details?.length > 0 ? 'visible' : 'hidden'
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Link
            href={url.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShortUrlClick}
          >
            {url.shortUrl}
          </Link>
        </TableCell>
        <TableCell>{url.originalUrl}</TableCell>
        <TableCell>{new Date(url.creationDate).toLocaleString()}</TableCell>
        <TableCell>{new Date(url.expiryDate).toLocaleString()}</TableCell>
        <TableCell align="right">{url.clicks?.total || 0}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Click Details
              </Typography>
              {url.clicks?.details && url.clicks.details.length > 0 ? (
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell align="right">Location (Coarse)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {url.clicks.details.map((click, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {new Date(click.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{click.source}</TableCell>
                        <TableCell align="right">{click.geo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No click data available for this URL yet.
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}


function StatisticsPage({ urls }) {
  useEffect(() => {
    logFrontendEvent('NAVIGATED_TO_STATISTICS_PAGE', { numberOfUrlsDisplayed: urls.length });
  }, [urls]);

  if (!urls || urls.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No Shortened URLs Available
        </Typography>
        <Typography variant="body1">
          Generate some short URLs on the Home page, or log in if you have past URLs.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener Statistics
      </Typography>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Short URL</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Creation Date</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell align="right">Total Clicks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {urls.map((url) => (
              <Row key={url.id} url={url} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default StatisticsPage;