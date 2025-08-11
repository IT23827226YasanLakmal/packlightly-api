const svc = require('../services/post.service');

async function create(req, res, next) { try { const payload = { ...req.body, authorUid: req.user.uid }; res.status(201).json(await svc.create(payload)); } catch(e){next(e);} }
async function list(req, res, next) { try { res.json(await svc.list()); } catch(e){next(e);} }
async function get(req, res, next) { try { res.json(await svc.get(req.params.id)); } catch(e){next(e);} }
async function update(req, res, next) { try { res.json(await svc.update(req.params.id, req.body)); } catch(e){next(e);} }
async function remove(req, res, next) { try { await svc.remove(req.params.id); res.json({ success: true }); } catch(e){next(e);} }

module.exports = { create, list, get, update, remove };
