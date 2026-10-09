const User = require('../models/User');

exports.getLogin = (req, res) => res.render('auth/login', { error: null });
exports.getRegister = (req, res) => res.render('auth/register', { error: null });

exports.postRegister = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    await User.create({ nombre, email, password });
    res.redirect('/auth/login');
  } catch (error) {
    res.render('auth/register', { error: 'Error al registrar usuario: ' + error.message });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { error: 'Credenciales incorrectas' });
    }
    req.session.userId = user._id;
    req.session.userName = user.nombre;
    res.redirect('/services');
  } catch (error) {
    res.render('auth/login', { error: 'Error en el servidor' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};