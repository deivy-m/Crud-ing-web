const Season = require('../models/Season');

exports.listSeasons = async (req, res) => {
  const seasons = await Season.find().sort({ fechaInicio: -1 });
  res.render('seasons/index', { seasons, user: req.session.userName });
};

exports.getCreateForm = (req, res) => {
  res.render('seasons/create', { error: null });
};

exports.createSeason = async (req, res) => {
  try {
    const { nombre, fechaInicio, fechaFin, factorPrecio } = req.body;

    // Validación backend: fechaFin debe ser posterior a fechaInicio
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      return res.render('seasons/create', { 
        error: 'La fecha de fin debe ser posterior a la fecha de inicio' 
      });
    }

    // Validación backend: factor de precio en rango válido
    const factor = parseFloat(factorPrecio);
    if (isNaN(factor) || factor < -0.5 || factor > 1.0) {
      return res.render('seasons/create', { 
        error: 'El factor de precio debe estar entre -0.50 y 1.00' 
      });
    }

    // Validación backend: no solapar con temporadas activas existentes
    const solapada = await Season.findOne({
      activo: true,
      $or: [
        { fechaInicio: { $lte: new Date(fechaFin) }, fechaFin: { $gte: new Date(fechaInicio) } }
      ]
    });
    if (solapada) {
      return res.render('seasons/create', { 
        error: 'Las fechas se solapan con la temporada existente: ' + solapada.nombre 
      });
    }

    await Season.create({ nombre, fechaInicio, fechaFin, factorPrecio: factor });
    res.redirect('/seasons');
  } catch (error) {
    res.render('seasons/create', { error: 'Error al crear temporada: ' + error.message });
  }
};

exports.getEditForm = async (req, res) => {
  const season = await Season.findById(req.params.id);
  res.render('seasons/edit', { season, error: null });
};

exports.updateSeason = async (req, res) => {
  try {
    const { nombre, fechaInicio, fechaFin, factorPrecio } = req.body;
    const seasonId = req.params.id;

    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      const season = await Season.findById(seasonId);
      return res.render('seasons/edit', { season, error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
    }

    const factor = parseFloat(factorPrecio);
    if (isNaN(factor) || factor < -0.5 || factor > 1.0) {
      const season = await Season.findById(seasonId);
      return res.render('seasons/edit', { season, error: 'El factor de precio debe estar entre -0.50 y 1.00' });
    }

    // Validar solapamiento excluyendo la temporada actual
    const solapada = await Season.findOne({
      _id: { $ne: seasonId },
      activo: true,
      fechaInicio: { $lte: new Date(fechaFin) },
      fechaFin: { $gte: new Date(fechaInicio) }
    });
    if (solapada) {
      const season = await Season.findById(seasonId);
      return res.render('seasons/edit', { season, error: 'Las fechas se solapan con: ' + solapada.nombre });
    }

    await Season.findByIdAndUpdate(seasonId, { nombre, fechaInicio, fechaFin, factorPrecio: factor });
    res.redirect('/seasons');
  } catch (error) {
    const season = await Season.findById(req.params.id);
    res.render('seasons/edit', { season, error: 'Error al actualizar: ' + error.message });
  }
};

exports.deleteSeason = async (req, res) => {
  await Season.findByIdAndDelete(req.params.id);
  res.redirect('/seasons');
};
