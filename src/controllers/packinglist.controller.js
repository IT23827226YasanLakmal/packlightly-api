const svc = require('../services/packinglist.service');

async function create(req, res, next) {try {
    const payload = { ...req.body, ownerUid: req.user.uid };
    const doc = await svc.create(payload); res.status(201).json(doc);
  } catch (e) { next(e); }
}
async function list(req, res, next) { try { const docs = await svc.list({ ownerUid: req.user.uid }); res.json(docs);} catch(e){next(e);} }
async function get(req, res, next) { try { res.json(await svc.get(req.params.id)); } catch(e){next(e);} }
async function update(req, res, next) { try { res.json(await svc.update(req.params.id, req.body)); } catch(e){next(e);} }
async function remove(req, res, next) { try { await svc.remove(req.params.id); res.json({ success: true }); } catch(e){next(e);} }


async function updateCategory (req, res) {
  try {
    const { id, category } = req.params;
    const { items } = req.body;
    
    // Validate category
    const validCategories = ['Clothing', 'Essentials', 'Toiletries', 'Electronics'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const packingList = await svc.updateCategoryItems(
      id, 
      category, 
      items, 
      req.user.uid
    );
    
    res.json(packingList);
  } catch (error) {
    if (error.message === 'Packing list not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

async function generateAIPackingList(req, res) {
    try {
      const { tripId } = req.params;
      const ownerUid = req.user.uid; 

      const packingList = await svc.generateAIPackingList(tripId, ownerUid);
      res.json({
        success: true,
        data: packingList,
        message: 'AI packing list generated successfully'
      });
    } catch (error) {
      console.error('Generate AI packing list error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate AI packing list' 
      });
    }
  }

async function addAISuggestions(req, res) {
    try {
      const { id } = req.params;
      const ownerUid = req.user.uid;

      const packingList = await svc.addAISuggestions(id, ownerUid);
      res.json({
        success: true,
        data: packingList,
        message: 'AI suggestions added successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

module.exports = { create, list, get, update, remove, updateCategory, generateAIPackingList, addAISuggestions };
