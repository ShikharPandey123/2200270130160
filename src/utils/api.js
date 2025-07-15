import { logFrontendEvent } from './logger'; // Using the new logger

const DEFAULT_VALIDITY_MINUTES = 30;

// Helper to simulate network delay
const simulateNetworkDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulates shortening a URL.
 * In a real app, this would be an API call to your backend.
 */
export const shortenUrl = async (longUrl, validityMinutes, customShortcode, existingUrls) => {
  await simulateNetworkDelay()

  // Client-side validation (basic, more comprehensive validation done in components)
  if (!isValidUrl(longUrl)) {
    throw new Error("Invalid URL format.");
  }
  if (customShortcode && !isValidShortcode(customShortcode)) {
    throw new Error("Invalid custom shortcode. Must be alphanumeric (a-z, A-Z, 0-9, -, _).");
  }

  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + (validityMinutes || DEFAULT_VALIDITY_MINUTES));

  let generatedShortcode = customShortcode;

  if (customShortcode) {
    // Check if custom shortcode already exists
    if (existingUrls.some(u => u.shortCode === customShortcode)) {
      logFrontendEvent('SHORTCODE_COLLISION', { shortcode: customShortcode, originalUrl: longUrl });
      throw new Error(`Custom shortcode '${customShortcode}' is already taken.`);
    }
  } else {
    // Generate a unique shortcode if not provided
    do {
      generatedShortcode = generateRandomShortcode();
    } while (existingUrls.some(u => u.shortCode === generatedShortcode));
  }

  const shortUrl = `${window.location.origin}/${generatedShortcode}`;
  const creationDate = new Date().toISOString();

  const newUrl = {
    id: Date.now().toString(), // Unique ID for mock data
    originalUrl: longUrl,
    shortCode: generatedShortcode,
    shortUrl: shortUrl,
    creationDate: creationDate,
    expiryDate: expiryDate.toISOString(),
    clicks: {
      total: 0,
      details: [],
    },
  };

  logFrontendEvent('API_CALL_MOCK_SHORTEN_SUCCESS', { originalUrl: longUrl, shortUrl: shortUrl });
  return newUrl;
};

/**
 * Simulates fetching all shortened URLs.
 * In a real app, this would be an API call to your backend.
 * For this demo, it reads from localStorage.
 */
export const getShortenedUrls = async () => {
  await simulateNetworkDelay();
  logFrontendEvent('API_CALL_MOCK_GET_ALL_URLS');
  return JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
};

/**
 * Simulates fetching click details for a short URL.
 * In a real app, this would be an API call to your backend.
 * For this demo, it reads from localStorage.
 */
export const getClickDetails = async (shortCode) => {
  await simulateNetworkDelay();
  const urls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
  const url = urls.find(u => u.shortCode === shortCode);
  logFrontendEvent('API_CALL_MOCK_GET_CLICK_DETAILS', { shortCode: shortCode, found: !!url });
  return url ? url.clicks.details : [];
};

// --- Helper Functions for Mocking ---

function generateRandomShortcode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (e) {
    return false;
  }
}

function isValidShortcode(code) {
  // Alphanumeric, hyphens, and underscores allowed, reasonable length (e.g., 3 to 20 characters)
  return /^[a-zA-Z0-9_-]{3,20}$/.test(code);
}


// --- Mock Authentication ---
export const mockLogin = async () => {
  await simulateNetworkDelay(200); // Simulate API call
  localStorage.setItem('isLoggedIn', 'true');
  logFrontendEvent('MOCK_LOGIN_SUCCESS');
  return true;
};

export const mockLogout = async () => {
  await simulateNetworkDelay(200); // Simulate API call
  localStorage.removeItem('isLoggedIn');
  logFrontendEvent('MOCK_LOGOUT_SUCCESS');
  return true;
};