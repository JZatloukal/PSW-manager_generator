/**
 * Konfigurace API URL pro různé prostředí.
 * 
 * Development: používá localhost:5001
 * Production: používá relativní cestu /api
 */
export const API_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api'
);
