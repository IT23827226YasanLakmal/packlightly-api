const svc = require('../services/trip.service');

async function create(req, res, next) {
  try {
    const payload = { ...req.body, ownerUid: req.user.uid };
    const doc = await svc.create(payload);
    res.status(201).json(doc);
  } catch (err) { next(err); }
}
async function list(req, res, next) {
  try {
    const docs = await svc.list({ ownerUid: req.user.uid });
    res.json(docs);
  } catch (err) { next(err); }
}
async function get(req, res, next) {
  try { const doc = await svc.get(req.params.id); res.json(doc); } catch (err) { next(err); }
}
async function update(req, res, next) {
  try { const doc = await svc.update(req.params.id, req.body); res.json(doc); } catch (err) { next(err); }
}
async function remove(req, res, next) {
  try { await svc.remove(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
}

module.exports = { create, list, get, update, remove };
