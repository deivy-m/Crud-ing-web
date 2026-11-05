const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Season = require('../models/Season');
const PricingRule = require('../models/PricingRule');

exports.showPricingCalculator = async (req, res) => {
  try {
    const services = await Service.find().sort({ nombre: 1 });
    const barbers = await Barber.find({ activo: true }).sort({ nombre: 1 });
    const seasons = await Season.find({ activo: true });
    const rules = await PricingRule.find({ activo: true }).populate('temporada');

    res.render('pricing/index', {
      services,
      barbers,
      seasons,
      rules,
      resultado: null,
      error: null,
      user: req.session ? req.session.userName : null
    });
  } catch (error) {
    res.status(500).send('Error al cargar cotizador: ' + error.message);
  }
};

exports.calculateDynamicPrice = async (req, res) => {
  try {
    const { servicioId, barberId, fecha, hora } = req.body;
    const services = await Service.find().sort({ nombre: 1 });
    const barbers = await Barber.find({ activo: true }).sort({ nombre: 1 });
    const seasons = await Season.find({ activo: true });
    const rules = await PricingRule.find({ activo: true }).populate('temporada');

    if (!servicioId || !barberId || !fecha || !hora) {
      return res.render('pricing/index', {
        services,
        barbers,
        seasons,
        rules,
        resultado: null,
        error: 'Por favor complete todos los campos (Servicio, Barbero, Fecha y Hora).',
        user: req.session ? req.session.userName : null
      });
    }

    // Validación de horario de atención: 10:00 AM a 8:00 PM (20:00)
    const [horas, minutos] = hora.split(':').map(Number);
    if (horas < 10 || horas > 20 || (horas === 20 && minutos > 0)) {
      return res.render('pricing/index', {
        services,
        barbers,
        seasons,
        rules,
        resultado: null,
        error: 'El horario de atención de la barbería es únicamente de 10:00 AM a 08:00 PM.',
        user: req.session ? req.session.userName : null
      });
    }

    const service = await Service.findById(servicioId);
    const barber = await Barber.findById(barberId);

    if (!service || !barber) {
      return res.render('pricing/index', {
        services,
        barbers,
        seasons,
        rules,
        resultado: null,
        error: 'Servicio o barbero no encontrado.',
        user: req.session ? req.session.userName : null
      });
    }

    const precioBase = Number(service.precio);
    const factoresAplicados = [];

    // 1. Factor por Categoría del Barbero
    let factorBarbero = 0;
    if (barber.categoria === 'Junior') {
      factorBarbero = 0;
      factoresAplicados.push({
        nombre: 'Barbero Junior',
        tipo: 'categoria_barbero',
        descripcion: `${barber.nombre} (Tarifa Estándar)`,
        porcentaje: '0%',
        impacto: 0
      });
    } else if (barber.categoria === 'Senior') {
      factorBarbero = 0.15;
      factoresAplicados.push({
        nombre: 'Barbero Senior',
        tipo: 'categoria_barbero',
        descripcion: `${barber.nombre} (+15% experiencia)`,
        porcentaje: '+15%',
        impacto: precioBase * factorBarbero
      });
    } else if (barber.categoria === 'Master') {
      factorBarbero = 0.30;
      factoresAplicados.push({
        nombre: 'Barbero Master',
        tipo: 'categoria_barbero',
        descripcion: `${barber.nombre} (+30% especialista)`,
        porcentaje: '+30%',
        impacto: precioBase * factorBarbero
      });
    }

    // 2. Factor Horario (Hora pico vs Hora valle)
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 5 = Viernes, 6 = Sábado
    let factorHorario = 0;

    // Lunes(1), Martes(2), Miércoles(3) de 10:00 a 12:00 -> Hora Valle (-15%)
    if ((diaSemana >= 1 && diaSemana <= 3) && (horas >= 10 && horas < 12)) {
      factorHorario = -0.15;
      factoresAplicados.push({
        nombre: 'Hora Valle (Happy Hour)',
        tipo: 'horario',
        descripcion: 'Lunes a Miércoles 10:00–12:00 (-15% descuento)',
        porcentaje: '-15%',
        impacto: precioBase * factorHorario
      });
    } 
    // Viernes(5), Sábado(6) de 14:00 a 20:00 -> Hora Pico (+20%)
    else if ((diaSemana === 5 || diaSemana === 6) && (horas >= 14 && horas <= 20)) {
      factorHorario = 0.20;
      factoresAplicados.push({
        nombre: 'Hora Pico (Alta Demanda)',
        tipo: 'horario',
        descripcion: 'Viernes y Sábados 14:00–20:00 (+20% recargo)',
        porcentaje: '+20%',
        impacto: precioBase * factorHorario
      });
    } else {
      factoresAplicados.push({
        nombre: 'Horario Regular',
        tipo: 'horario',
        descripcion: 'Horario habitual sin recargo (0%)',
        porcentaje: '0%',
        impacto: 0
      });
    }

    // 3. Factor Temporada Especial
    let factorTemporada = 0;
    const temporadaCoincidente = seasons.find(s => {
      const inicio = new Date(s.fechaInicio);
      const fin = new Date(s.fechaFin);
      return fechaObj >= inicio && fechaObj <= fin;
    });

    if (temporadaCoincidente) {
      factorTemporada = Number(temporadaCoincidente.factorPrecio);
      const pctStr = (factorTemporada >= 0 ? '+' : '') + (factorTemporada * 100).toFixed(0) + '%';
      factoresAplicados.push({
        nombre: `Temporada: ${temporadaCoincidente.nombre}`,
        tipo: 'temporada',
        descripcion: `Del ${new Date(temporadaCoincidente.fechaInicio).toLocaleDateString('es-EC')} al ${new Date(temporadaCoincidente.fechaFin).toLocaleDateString('es-EC')}`,
        porcentaje: pctStr,
        impacto: precioBase * factorTemporada
      });
    }

    // Cálculo final dinámico
    const multiplicadorTotal = (1 + factorBarbero) * (1 + factorHorario) * (1 + factorTemporada);
    const precioFinal = precioBase * multiplicadorTotal;

    const resultado = {
      servicio: service.nombre,
      precioBase: precioBase.toFixed(2),
      barbero: `${barber.nombre} (${barber.categoria})`,
      fecha,
      hora: (horas > 12 ? (horas - 12) : horas) + ':' + (minutos < 10 ? '0' + minutos : minutos) + ' ' + (horas >= 12 ? 'PM' : 'AM'),
      factoresAplicados,
      precioFinal: precioFinal.toFixed(2),
      diferencia: (precioFinal - precioBase).toFixed(2)
    };

    res.render('pricing/index', {
      services,
      barbers,
      seasons,
      rules,
      resultado,
      error: null,
      user: req.session ? req.session.userName : null
    });
  } catch (error) {
    res.status(500).send('Error al calcular precio: ' + error.message);
  }
};
