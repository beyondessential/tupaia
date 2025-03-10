import jwt from 'jsonwebtoken';

const extractTokenDetails = decodedToken => {
  if (decodedToken === null || typeof decodedToken === 'string') {
    throw new Error('Got unexpected result from decoded jwt token');
  }

  if (!('exp' in decodedToken) || !('iat' in decodedToken)) {
    throw new Error('Decoded jwt token missing expected fields');
  }

  const { exp, iat } = decodedToken;
  return [exp, iat];
};

/**
 * @param {string} accessToken
 * @returns {number} token expiry date in unix epoch
 */
export const getTokenExpiry = accessToken => {
  const [expiryAuthServerClock, issuedAtAuthServerClock] = extractTokenDetails(
    jwt.decode(accessToken),
  );

  // subtract 3 seconds to account for latency since generation on the auth server
  const validForSeconds = expiryAuthServerClock - issuedAtAuthServerClock - 3;
  const expiryServerClock = Date.now() + validForSeconds * 1000;
  return expiryServerClock;
};
