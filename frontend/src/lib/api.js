const PROD_API_BASE_URL = 'https://railworker-production.up.railway.app';

const isPrivateIpv4Host = (hostname = '') => {
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  const match = hostname.match(/^172\.(\d{1,3})\./);
  if (!match) return false;
  const secondOctet = Number(match[1]);
  return secondOctet >= 16 && secondOctet <= 31;
};

const getLocalApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { protocol, hostname } = window.location;
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    isPrivateIpv4Host(hostname);

  if (!isLocalHost) {
    return null;
  }

  return `${protocol}//${hostname}:4000`;
};

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  getLocalApiBaseUrl() ||
  PROD_API_BASE_URL;

export const apiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
