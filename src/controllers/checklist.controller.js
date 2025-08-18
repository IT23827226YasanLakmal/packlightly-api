const svc = require('../services/checklist.service');

// Create a new checklist under a packing list
async function create(req, res, next) {
    try {
        const payload = {
            ...req.body,
            packingListId: req.params.packingListId,
            ownerUid: req.user.uid
        };
        const doc = await svc.create(payload);
        res.status(201).json(doc);
    } catch (e) {
        next(e);
    }
}

// List all checklists under a packing list for current user
async function list(req, res, next) {
    try {
        const docs = await svc.list({
            packingListId: req.params.packingListId,
            ownerUid: req.user.uid
        });
        res.json(docs);
    } catch (e) {
        next(e);
    }
}

// Get single checklist by ID
async function get(req, res, next) {
    try {
        res.json(await svc.get(req.params.id));
    } catch (e) {
        next(e);
    }
}

// Update checklist by ID
async function update(req, res, next) {
    try {
        res.json(await svc.update(req.params.id, req.body));
    } catch (e) {
        next(e);
    }
}

// Remove checklist by ID
async function remove(req, res, next) {
    try {
        await svc.remove(req.params.id);
        res.json({ success: true });
    } catch (e) {
        next(e);
    }
}

module.exports = { create, list, get, update, remove };
