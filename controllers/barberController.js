const Barber = require('../models/Barber');

/**
 * VALIDACIÓN EN BACK-END DE DATO SENSIBLE: CÉDULA ECUATORIANA
 * Algoritmo oficial de módulo 10 utilizado por el Registro Civil de Ecuador.
 * No depende de JavaScript en el navegador: se valida estrictamente en el servidor
 * antes de interactuar o guardar en la base de datos MongoDB.
 */
function validarCedulaEcuatoriana(cedula) {
  if (!cedula || typeof cedula !== 'string') return false;

  // 1. Debe tener exactamente 10 dígitos numéricos
  const limpia = cedula.trim();
  if (!/^\d{10}$/.test(limpia)) {
    return false;
  }

  // 2. Los dos primeros dígitos corresponden a la provincia (01 a 24, o 30 para casos especiales)
  const provincia = parseInt(limpia.substring(0, 2), 10);
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
    return false;
  }

  // 3. El tercer dígito debe ser menor a 6 para personas naturales
  const tercerDigito = parseInt(limpia.charAt(2), 10);
  if (tercerDigito >= 6) {
    return false;
  }

  // 4. Algoritmo de verificación módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(limpia.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const digitoVerificadorCalculado = (10 - (suma % 10)) % 10;
  const digitoVerificadorReal = parseInt(limpia.charAt(9), 10);

  return digitoVerificadorCalculado === digitoVerificadorReal;
}

// Validación backend auxiliar de formato de correo
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

exports.listBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find().sort({ nombre: 1 });
    res.render('barbers/index', { barbers, user: req.session.userName });
  } catch (error) {
    res.status(500).render('services/index', { 
      services: [], 
      user: req.session.userName, 
      error: 'Error al listar barberos: ' + error.message 
    });
  }
};

exports.getCreateForm = (req, res) => {
  res.render('barbers/create', { error: null, data: {} });
};

exports.createBarber = async (req, res) => {
  const { nombre, cedula, email, telefono, categoria } = req.body;
  const formData = { nombre, cedula, email, telefono, categoria };

  try {
    // 🚨 VALIDACIÓN BACK-END 1 (DATO SENSIBLE): Cédula ecuatoriana
    if (!validarCedulaEcuatoriana(cedula)) {
      return res.render('barbers/create', { 
        error: '🚨 [Error Back-End]: La cédula "' + (cedula || '') + '" no es válida según el algoritmo de verificación del Registro Civil ecuatoriano (módulo 10).',
        data: formData
      });
    }

    // 🚨 VALIDACIÓN BACK-END 2 (DATO SENSIBLE): Unicidad de cédula en BD
    const cedulaExistente = await Barber.findOne({ cedula: cedula.trim() });
    if (cedulaExistente) {
      return res.render('barbers/create', { 
        error: '🚨 [Error Back-End]: Ya existe un barbero registrado con la cédula ' + cedula,
        data: formData
      });
    }

    // Validación Back-End: Formato de email
    if (!validarEmail(email)) {
      return res.render('barbers/create', { 
        error: 'El formato del correo electrónico no es válido (ejemplo@dominio.com).',
        data: formData
      });
    }

    // Validación Back-End: Correo único
    const emailExistente = await Barber.findOne({ email: email.toLowerCase().trim() });
    if (emailExistente) {
      return res.render('barbers/create', { 
        error: 'Ya existe un barbero registrado con el correo ' + email,
        data: formData
      });
    }

    // Validación Back-End: Categoría permitida
    const categoriasValidas = ['Junior', 'Senior', 'Master'];
    if (!categoriasValidas.includes(categoria)) {
      return res.render('barbers/create', { 
        error: 'La categoría debe ser Junior, Senior o Master.',
        data: formData
      });
    }

    await Barber.create({
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefono.trim(),
      categoria
    });

    res.redirect('/barbers');
  } catch (error) {
    res.render('barbers/create', { 
      error: 'Error al registrar barbero: ' + error.message,
      data: formData
    });
  }
};

exports.getEditForm = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) return res.redirect('/barbers');
    res.render('barbers/edit', { barber, error: null });
  } catch (error) {
    res.redirect('/barbers');
  }
};

exports.updateBarber = async (req, res) => {
  const { nombre, cedula, email, telefono, categoria } = req.body;
  const barberId = req.params.id;

  try {
    // 🚨 VALIDACIÓN BACK-END 1 (DATO SENSIBLE): Cédula ecuatoriana
    if (!validarCedulaEcuatoriana(cedula)) {
      const barber = await Barber.findById(barberId);
      return res.render('barbers/edit', { 
        barber: { ...barber.toObject(), nombre, cedula, email, telefono, categoria }, 
        error: '🚨 [Error Back-End]: La cédula "' + cedula + '" es inválida según el algoritmo del Registro Civil.' 
      });
    }

    // 🚨 VALIDACIÓN BACK-END 2: Cédula única excluyendo al barbero actual
    const cedulaExistente = await Barber.findOne({ cedula: cedula.trim(), _id: { $ne: barberId } });
    if (cedulaExistente) {
      const barber = await Barber.findById(barberId);
      return res.render('barbers/edit', { 
        barber: { ...barber.toObject(), nombre, cedula, email, telefono, categoria }, 
        error: '🚨 [Error Back-End]: Ya existe otro barbero registrado con esa cédula.' 
      });
    }

    // Validación Back-End: Formato email
    if (!validarEmail(email)) {
      const barber = await Barber.findById(barberId);
      return res.render('barbers/edit', { 
        barber: { ...barber.toObject(), nombre, cedula, email, telefono, categoria }, 
        error: 'El formato del email no es válido.' 
      });
    }

    // Validación Back-End: Email único excluyendo al actual
    const emailExistente = await Barber.findOne({ email: email.toLowerCase().trim(), _id: { $ne: barberId } });
    if (emailExistente) {
      const barber = await Barber.findById(barberId);
      return res.render('barbers/edit', { 
        barber: { ...barber.toObject(), nombre, cedula, email, telefono, categoria }, 
        error: 'Ya existe otro barbero registrado con ese email.' 
      });
    }

    await Barber.findByIdAndUpdate(barberId, {
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefono.trim(),
      categoria
    });

    res.redirect('/barbers');
  } catch (error) {
    const barber = await Barber.findById(barberId);
    res.render('barbers/edit', { barber, error: 'Error al actualizar: ' + error.message });
  }
};

exports.deleteBarber = async (req, res) => {
  try {
    await Barber.findByIdAndDelete(req.params.id);
    res.redirect('/barbers');
  } catch (error) {
    res.redirect('/barbers');
  }
};
