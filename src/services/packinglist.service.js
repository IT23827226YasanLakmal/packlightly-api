
const PackingList = require('../models/PackingList');



async function create(data) { return PackingList.create(data); }
async function list(q = {}) { return PackingList.find(q); }
async function get(id) { return PackingList.findById(id); }
async function update(id, data) { return PackingList.findByIdAndUpdate(id, data, { new: true }); }
async function remove(id) { return PackingList.findByIdAndDelete(id); }


/** -----------------------------
 * List all checklists for a Packing List
 * ----------------------------*/
async function listChecklists(packingListId){
  const packingList = await PackingList.findById(packingListId);
  if (!packingList) {
    throw new Error("Packing list not found");
  }
  return packingList.categories;
};

/** -----------------------------
 * Create a new checklist under a Packing List
 * ----------------------------*/
async function createChecklist(
  packingListId,
  name,
  items = []
){
  const packingList = await PackingList.findById(packingListId);
  if (!packingList) {
    throw new Error("Packing list not found");
  }

  packingList.categories.push({ name, items });
  await packingList.save();

  // return the newly added checklist (last item in array)
  return packingList.categories[packingList.categories.length - 1];
};

module.exports = { create, list, get, update, remove, listChecklists, createChecklist };
