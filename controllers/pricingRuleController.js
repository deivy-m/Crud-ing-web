const PricingRule = require('../models/PricingRule');
const Season = require('../models/Season');

exports.listRules = async (req, res) => {
  const rules = await PricingRule.find().populate('temporada').sort({ tipo: 1 });
  res.render('pricing-rules/index', { rules, user: req.session.userName });
};

exports.getCreateForm = async (req, res) => {
  const seasons = await Season.find({ activo: true }).sort({ nombre: 1 });
  res.render('pricing-rules/create', { seasons, error: null });
};

exports.createRule = async (req, res) => {
  try {
    const { nombre, tipo, condicion, factor, descripcion, temporada } = req.body;

    // Validación backend: factor en rango válido
    const factorNum = parseFloat(factor);
    if (isNaN(factorNum) || factorNum < -0.5 || factorNum > 1.0) {
      const seasons = await Season.find({ activo: true });
      return res.render('pricing-rules/create', { 
        seasons, error: 'El factor debe estar entre -0.50 y 1.00' 
      });
    }

    // Validación backend: si tipo es temporada, debe seleccionar una temporada
    if (tipo === 'temporada' && (!temporada || temporada === '')) {
      const seasons = await Season.find({ activo: true });
      return res.render('pricing-rules/create', { 
        seasons, error: 'Debe seleccionar una temporada para reglas de tipo "temporada"' 
      });
    }

    const data = { nombre, tipo, condicion, factor: factorNum, descripcion, activo: true };
    if (tipo === 'temporada' && temporada) {
      data.temporada = temporada;
    }

    await PricingRule.create(data);
    res.redirect('/pricing-rules');
  } catch (error) {
    const seasons = await Season.find({ activo: true });
    res.render('pricing-rules/create', { seasons, error: 'Error al crear regla: ' + error.message });
  }
};

exports.getEditForm = async (req, res) => {
  const rule = await PricingRule.findById(req.params.id);
  const seasons = await Season.find({ activo: true }).sort({ nombre: 1 });
  res.render('pricing-rules/edit', { rule, seasons, error: null });
};

exports.updateRule = async (req, res) => {
  try {
    const { nombre, tipo, condicion, factor, descripcion, temporada } = req.body;
    const ruleId = req.params.id;

    const factorNum = parseFloat(factor);
    if (isNaN(factorNum) || factorNum < -0.5 || factorNum > 1.0) {
      const rule = await PricingRule.findById(ruleId);
      const seasons = await Season.find({ activo: true });
      return res.render('pricing-rules/edit', { rule, seasons, error: 'Factor fuera de rango' });
    }

    if (tipo === 'temporada' && (!temporada || temporada === '')) {
      const rule = await PricingRule.findById(ruleId);
      const seasons = await Season.find({ activo: true });
      return res.render('pricing-rules/edit', { rule, seasons, error: 'Seleccione una temporada' });
    }

    const data = { nombre, tipo, condicion, factor: factorNum, descripcion };
    if (tipo === 'temporada' && temporada) {
      data.temporada = temporada;
    } else {
      data.temporada = null;
    }

    await PricingRule.findByIdAndUpdate(ruleId, data);
    res.redirect('/pricing-rules');
  } catch (error) {
    const rule = await PricingRule.findById(req.params.id);
    const seasons = await Season.find({ activo: true });
    res.render('pricing-rules/edit', { rule, seasons, error: 'Error: ' + error.message });
  }
};

exports.deleteRule = async (req, res) => {
  await PricingRule.findByIdAndDelete(req.params.id);
  res.redirect('/pricing-rules');
};
