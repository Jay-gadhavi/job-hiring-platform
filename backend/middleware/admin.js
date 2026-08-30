const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      req.user.role = 'admin';
      return next();
    }

    res.status(403).json({ message: 'Admin access required' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = admin;

