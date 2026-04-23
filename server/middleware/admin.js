const auth = require('./auth');

// Admin middleware: authenticates JWT first, then checks admin role
function adminAuth(req, res, next) {
  auth(req, res, (err) => {
    if (err) return; // auth middleware already sent response
    if (res.headersSent) return; // auth already responded with 401

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  });
}

module.exports = adminAuth;
