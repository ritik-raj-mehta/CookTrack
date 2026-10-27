// controllers/kitchenController.js

import Kitchen from '../models/Kitchen.js';
import KitchenItem from '../models/KitchenItem.js';
import ShoppingItem from '../models/ShoppingItem.js';
import User from '../models/User.js';

const addItemsToKitchen = async (req, res) => {
  const { kitchenId } = req.params; // if your route uses :KitchenId
  const body = req.body;

  try {
    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId });
    if (!kitchen) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'Kitchen not exists.' });
    }

    const item = new KitchenItem({ ...body, kitchenId: kitchenId });
    await item.save();

    kitchen.kitchenItemIds.push(item._id);
    kitchen.updatedAt = new Date();
    await kitchen.save();

    return res.json({
      isSuccess: true,
      message: 'Item added successfully.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

const addShoppingItemsToKitchen = async (req, res) => {
  const { kitchenId } = req.params;
  const body = req.body;

  try {
    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId });
    if (!kitchen) {
      return res.status(404).json({
        isSuccess: false,
        message: "Kitchen doesn't exist."
      });
    }

    const shopItem = new ShoppingItem({ ...body, kitchenId: kitchenId });
    await shopItem.save();

    kitchen.kitchenShoppingItemIds.push(shopItem._id);
    kitchen.updatedAt = new Date();
    await kitchen.save();

    return res.json({
      isSuccess: true,
      message: 'Shopping item added successfully.',
      data: shopItem
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

const getKitchen = async (req, res) => {
  const { kitchenId, Id } = req.params;

  try {
    const user = await User.findById(Id);
    if (!user) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'User not found.' });
    }

    if (user.kitchenId !== kitchenId) {
      return res.status(403).json({
        isSuccess: false,
        message: 'Kitchen does not belong to this person'
      });
    }

    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId })
      .populate('kitchenItemIds')
      .populate('kitchenShoppingItemIds');

    return res.json({
      isSuccess: true,
      message: 'Kitchen data fetched successfully.',
      data: kitchen
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occur : ' + err.message
    });
  }
};

const getAllKitchenItemsByKitchenId = async (req, res) => {
  const { kitchenId } = req.params;

  try {
    const data = await KitchenItem.find({ kitchenId: kitchenId });

    return res.json({
      isSuccess: true,
      message: 'All kitchen data fetch successfully.',
      data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occur : ' + err.message
    });
  }
};

const getKitchenMembers = async (req, res) => {
  const { kitchenId } = req.params;

  try {
    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId });
    if (!kitchen) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'Kitchen not found' });
    }

    const members = await User.find(
      { kitchenId: kitchenId },
      'userName userEmail role phoneNumber createdAt'
    );

    return res.json({
      isSuccess: true,
      message: 'Kitchen members fetched successfully.',
      data: {
        kitchenName: kitchen.kitchenName,
        kitchenId: kitchen.kitchenId,
        createdBy: kitchen.createdBy,
        members
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

const deleteKitchenItem = async (req, res) => {
  const { kitchenId , itemId } = req.params;

  try {
    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId });
    if (!kitchen) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'Kitchen not found' });
    }

    // remove item document
    await KitchenItem.findByIdAndDelete(itemId);

    // remove from array
    kitchen.kitchenItemIds = kitchen.kitchenItemIds.filter(
      (id) => id.toString() !== itemId
    );
    kitchen.updatedAt = new Date();
    await kitchen.save();

    return res.json({
      isSuccess: true,
      message: 'Item deleted.',
      itemId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: err.message
    });
  }
};

const getAllShoppingItemsByKitchenId = async (req, res) => {
  const { kitchenId } = req.params;

  try {
    const data = await ShoppingItem.find({ kitchenId: kitchenId }).sort({ createdAt: -1 });

    return res.json({
      isSuccess: true,
      message: 'Shopping items fetched successfully.',
      data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

const toggleShoppingItemBought = async (req, res) => {
  const { kitchenId, itemId } = req.params;

  try {
    const item = await ShoppingItem.findOne({ _id: itemId, kitchenId: kitchenId });
    if (!item) {
      return res.status(404).json({
        isSuccess: false,
        message: 'Shopping item not found.'
      });
    }

    item.isBought = !item.isBought;
    await item.save();

    return res.json({
      isSuccess: true,
      message: 'Status updated.',
      data: item
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

const deleteShoppingItem = async (req, res) => {
  const { kitchenId, itemId } = req.params;

  try {
    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId });
    if (kitchen) {
      kitchen.kitchenShoppingItemIds = kitchen.kitchenShoppingItemIds.filter(
        (id) => id.toString() !== itemId
      );
      kitchen.updatedAt = new Date();
      await kitchen.save();
    }

    await ShoppingItem.findByIdAndDelete(itemId);

    return res.json({
      isSuccess: true,
      message: 'Shopping item deleted.',
      itemId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

export default {
  addItemsToKitchen,
  addShoppingItemsToKitchen,
  getKitchen,
  getAllKitchenItemsByKitchenId,
  getKitchenMembers,
  deleteKitchenItem,
  getAllShoppingItemsByKitchenId,
  toggleShoppingItemBought,
  deleteShoppingItem
};
