const Service = require('../models/Service');

exports.listServices = async (req, res) => {
  const services = await Service.find();
  res.render('services/index', { services, user: req.session.userName });
};

exports.getCreateForm = (req, res) => res.render('services/create');

exports.createService = async (req, res) => {
  await Service.create(req.body);
  res.redirect('/services');
};

exports.getEditForm = async (req, res) => {
  const service = await Service.findById(req.params.id);
  res.render('services/edit', { service });
};

exports.updateService = async (req, res) => {
  await Service.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/services');
};

exports.deleteService = async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.redirect('/services');
};