const svc = require('../services/packinglist.service');

async function create(req, res, next) {
  try {
    const payload = { ...req.body, ownerUid: req.user.uid };
    const doc = await svc.create(payload); res.status(201).json(doc);
  } catch (e) { next(e); }
}
async function list(req, res, next) { try { const docs = await svc.list({ ownerUid: req.user.uid }); res.json(docs);} catch(e){next(e);} }
async function get(req, res, next) { try { res.json(await svc.get(req.params.id)); } catch(e){next(e);} }
async function update(req, res, next) { try { res.json(await svc.update(req.params.id, req.body)); } catch(e){next(e);} }
async function remove(req, res, next) { try { await svc.remove(req.params.id); res.json({ success: true }); } catch(e){next(e);} }

/** List all checklists */
async function listChecklists(req, res) {
  try {
    const { packingListId } = req.params;
    const categories = await svc.listChecklists(packingListId);
    res.json(categories);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/** Create new checklist */
async function createChecklist(req, res) {
  try {
    const { packingListId } = req.params;
    const { name, items } = req.body;

    const newChecklist = await svc.createChecklist(
      packingListId,
      name,
      items
    );

    res.status(201).json(newChecklist);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { create, list, get, update, remove, listChecklists, createChecklist };
