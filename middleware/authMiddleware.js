module.exports = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.redirect('/auth/login');
};