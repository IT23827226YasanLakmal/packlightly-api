
const Trip = require('../models/Trip');
const PackingList = require('../models/PackingList');
const ollamaService = require('../utils/ollamaService');


async function create(data) { return PackingList.create(data); }
async function list(q = {}) { return PackingList.find(q); }
async function get(id) { return PackingList.findById(id); }
async function update(id, data) { return PackingList.findByIdAndUpdate(id, data, { new: true }); }
async function remove(id) { return PackingList.findByIdAndDelete(id); }

async function updateCategoryItems(id, category, items, ownerUid) {
  const packingList = await PackingList.findById(id);

  if (!packingList) {
    throw new Error('Packing list not found');
  }

  // Check ownership
  if (packingList.ownerUid !== ownerUid) {
    throw new Error('Access denied');
  }

  // Find the category in the packing list
  const categoryIndex = packingList.categories.findIndex(
    cat => cat.name === category
  );

  if (categoryIndex === -1) {
    // Category doesn't exist yet, create it
    packingList.categories.push({
      name: category,
      items: items.map(item => ({
        name: item.name || item,
        quantity: item.quantity || 1,
        packed: item.packed || false,
        essential: item.essential || ollamaService.isEssentialItem(category, item.name || item),
        suggestedByAI: item.suggestedByAI || false
      }))
    });
  } else {
    // Update existing category
    packingList.categories[categoryIndex].items = items.map(item => ({
      name: item.name || item,
      quantity: item.quantity || 1,
      packed: item.packed || false,
      essential: item.essential || ollamaService.isEssentialItem(category, item.name || item),
      suggestedByAI: item.suggestedByAI || false
    }));
  }

  return await packingList.save();
}
async function generateAIPackingList(tripId, ownerUid) {
  try {
    // Get trip data
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    
    // Generate AI suggestions
    const aiSuggestions = await ollamaService.generatePackingSuggestion(trip);

    const categories = aiSuggestions.categories.map(categoryData => ({
      name: categoryData.category,
      items: categoryData.items.map(item => {
        if (typeof item === 'object' && item.name) {
          if (typeof item.name === 'object' && item.name.name) {
            return {
              name: item.name.name,
              qty: item.name.qty || item.qty || 1,
              checked: item.name.checked || item.checked || false,
              eco: item.name.eco || item.eco || false,
              suggestedByAI: true
            };
          } else {
            return {
              name: item.name,
              qty: item.qty || 1,
              checked: item.checked || false,
              eco: item.eco || false,
              suggestedByAI: true
            };
          }
        }
        return {
          name: String(item),
          qty: 1,
          checked: false,
          eco: false,
          suggestedByAI: true
        };
      })
    }));

    return await PackingList.create({
      tripId,
      ownerUid,
      title: aiSuggestions.title || `${trip.destination} Packing List`,
      categories,
      isAIGenerated: true,
      lastAIGeneratedAt: new Date()
    });

  } catch (error) {
    console.error('AI packing list generation error:', error);
    throw new Error('Failed to generate AI packing list: ' + error.message);
  }
}
async function addAISuggestions(id, ownerUid) {
  const packingList = await PackingList.findById(id);
  
  if (!packingList) {
    throw new Error('Packing list not found');
  }

  if (packingList.ownerUid !== ownerUid) {
    throw new Error('Access denied');
  }

  const trip = await Trip.findById(packingList.tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Generate AI suggestions
  const aiSuggestions = await ollamaService.generatePackingSuggestion(trip);

  // Merge AI suggestions with existing list
  aiSuggestions.forEach(aiCategory => {
    const existingCategory = packingList.categories.find(
      cat => cat.name === aiCategory.category
    );

    if (existingCategory) {
      // Add only new items from AI
      aiCategory.items.forEach(aiItem => {
        let itemName = typeof aiItem === 'object' && aiItem.name ? (typeof aiItem.name === 'object' ? aiItem.name.name : aiItem.name) : aiItem;
        const itemExists = existingCategory.items.some(
          item => item.name.toLowerCase() === String(itemName).toLowerCase()
        );
        if (!itemExists) {
          existingCategory.items.push({
            name: itemName,
            quantity: aiItem.qty || aiItem.quantity || 1,
            packed: typeof aiItem.checked === 'boolean' ? aiItem.checked : false,
            essential: typeof aiItem.eco === 'boolean' ? aiItem.eco : ollamaService.isEssentialItem(aiCategory.category, itemName),
            suggestedByAI: typeof aiItem.suggestedByAI === 'boolean' ? aiItem.suggestedByAI : true
          });
        }
      });
    } else {
      // Create new category
      packingList.categories.push({
        name: aiCategory.category,
        items: aiCategory.items.map(aiItem => {
          let itemName = typeof aiItem === 'object' && aiItem.name ? (typeof aiItem.name === 'object' ? aiItem.name.name : aiItem.name) : aiItem;
          return {
            name: itemName,
            quantity: aiItem.qty || aiItem.quantity || 1,
            packed: typeof aiItem.checked === 'boolean' ? aiItem.checked : false,
            essential: typeof aiItem.eco === 'boolean' ? aiItem.eco : ollamaService.isEssentialItem(aiCategory.category, itemName),
            suggestedByAI: typeof aiItem.suggestedByAI === 'boolean' ? aiItem.suggestedByAI : true
          };
        })
      });
    }
  });

  packingList.isAIGenerated = true;
  packingList.lastAIGeneratedAt = new Date();
  
  return await packingList.save();
}

module.exports = { create, list, get, update, remove, updateCategoryItems, generateAIPackingList, addAISuggestions };
