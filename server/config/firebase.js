const jwt = require('jsonwebtoken');
const https = require('https');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const KEYS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let _keys = {};
let _keysExpiry = 0;

function fetchPublicKeys() {
  return new Promise((resolve, reject) => {
    https.get(KEYS_URL, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const cc = res.headers['cache-control'] || '';
          const match = cc.match(/max-age=(\d+)/);
          _keysExpiry = Date.now() + (match ? parseInt(match[1]) * 1000 : 3_600_000);
          _keys = JSON.parse(body);
          resolve(_keys);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getPublicKeys() {
  if (Date.now() < _keysExpiry && Object.keys(_keys).length > 0) return _keys;
  return fetchPublicKeys();
}

async function verifyFirebaseIdToken(idToken) {
  if (!PROJECT_ID) throw new Error('FIREBASE_PROJECT_ID env var is not set.');

  const keys = await getPublicKeys();

  const [headerB64] = idToken.split('.');
  const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());

  const cert = keys[header.kid];
  if (!cert) throw new Error('Firebase ID token has unknown key id.');

  const decoded = jwt.verify(idToken, cert, {
    algorithms: ['RS256'],
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });

  return decoded;
}

module.exports = { verifyFirebaseIdToken };
