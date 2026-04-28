/**
 * Firebase Auth Middleware
 * Verifies Firebase ID tokens for protected routes
 * Google Service: Firebase Admin SDK
 */
let admin = null;

try {
  const firebaseAdmin = require('firebase-admin');
  if (!firebaseAdmin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    admin = firebaseAdmin;
  }
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    admin = null;
  } else {
    console.warn('[Auth] Firebase Admin not initialized:', e.message);
  }
}

/** Verify Firebase ID token - rejects unauthorized requests */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split('Bearer ')[1];
    if (!admin) {
      // Graceful dev fallback
      req.user = { uid: 'dev-user', email: 'dev@votewise.ai' };
      return next();
    }
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/** Optional auth - continues even without token */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ') && admin) {
      const token = authHeader.split('Bearer ')[1];
      req.user = await admin.auth().verifyIdToken(token);
    }
  } catch { /* silent */ }
  next();
};

module.exports = { verifyToken, optionalAuth };
