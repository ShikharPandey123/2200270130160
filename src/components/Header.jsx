import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { logFrontendEvent } from '../utils/logger';

function Header({ isLoggedIn, onLogin, onLogout }) {
  const handleLoginClick = () => {
    onLogin();
    logFrontendEvent('UI_ACTION_LOGIN_BUTTON_CLICKED');
  };

  const handleLogoutClick = () => {
    onLogout();
    logFrontendEvent('UI_ACTION_LOGOUT_BUTTON_CLICKED');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            URL Shortener
          </Link>
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/" onClick={() => logFrontendEvent('UI_ACTION_NAV_HOME')}>
            Home
          </Button>
          <Button color="inherit" component={Link} to="/statistics" onClick={() => logFrontendEvent('UI_ACTION_NAV_STATS')}>
            Statistics
          </Button>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogoutClick}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLoginClick}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;