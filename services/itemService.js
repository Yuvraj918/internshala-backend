const Item = require('../models/Item');

class ItemService {
  // Create a new item
  async createItem(itemData) {
    try {
      const newItem = new Item(itemData);
      const savedItem = await newItem.save();
      return savedItem;
    } catch (error) {
      throw new Error(`Error creating item: ${error.message}`);
    }
  }

  // Get all items
  async getAllItems() {
    try {
      const items = await Item.find().sort({ createdAt: -1 });
      return items;
    } catch (error) {
      throw new Error(`Error fetching items: ${error.message}`);
    }
  }

  
}

module.exports = new ItemService();