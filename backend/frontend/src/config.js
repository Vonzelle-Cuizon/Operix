// API Configuration
// Use Render backend URL: https://operix.onrender.com
// In development (localhost), use relative paths (same origin)
// In production (Vercel), use the Render backend URL

const API_BASE_URL = 'https://operix.onrender.com';

// Helper function to build API endpoint URLs
export const apiEndpoint = (path) => {
  // If path already starts with http, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Check if we're running on localhost (development)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  // In development (localhost), use relative paths (same origin)
  // In production (Vercel or other), use absolute URL to Render backend
  if (isLocalhost) {
    return cleanPath;
  }
  
  // Production: use Render backend URL
  return `${API_BASE_URL}${cleanPath}`;
};
