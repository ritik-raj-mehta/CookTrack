import bcrypt from 'bcrypt';
import Kitchen from '../models/Kitchen.js';
import KitchenItem from '../models/KitchenItem.js';
import ShoppingItem from '../models/ShoppingItem.js';
import User from '../models/User.js';

const normalizePhone = (str) => {
  if (!str) return '';
  const digits = String(str).replace(/\D/g, '');
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
};

const verifyAdminCredentials = async (adminUser, password, phoneNumber) => {
  if (!password || !String(password).trim()) {
    return {
      isValid: false,
      message: 'Admin password is required to authorize this action.'
    };
  }

  if (!phoneNumber || !String(phoneNumber).trim()) {
    return {
      isValid: false,
      message: 'Registered mobile number is required to authorize this action.'
    };
  }

  const isPasswordMatch = await bcrypt.compare(password, adminUser.userPassword);
  if (!isPasswordMatch) {
    return { isValid: false, message: 'Invalid admin password. Verification failed.' };
  }

  const dbPhoneNorm = normalizePhone(adminUser.phoneNumber);
  const inputPhoneNorm = normalizePhone(phoneNumber);

  if (dbPhoneNorm && inputPhoneNorm) {
    if (dbPhoneNorm !== inputPhoneNorm) {
      return {
        isValid: false,
        message: 'Mobile number does not match your registered admin mobile number.'
      };
    }
  } else if (adminUser.phoneNumber && String(adminUser.phoneNumber).trim()) {
    if (String(adminUser.phoneNumber).trim() !== String(phoneNumber).trim()) {
      return {
        isValid: false,
        message: 'Mobile number does not match your registered admin mobile number.'
      };
    }
  }

  return { isValid: true };
};

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

const updateKitchenItem = async (req, res) => {
  const { kitchenId, itemId } = req.params;
  const updates = req.body;

  try {
    const item = await KitchenItem.findOne({ _id: itemId, kitchenId: kitchenId });
    if (!item) {
      return res.status(404).json({
        isSuccess: false,
        message: 'Kitchen item not found.'
      });
    }

    if (updates.productName !== undefined) item.productName = updates.productName;
    if (updates.category !== undefined) item.category = updates.category;
    if (updates.quantity !== undefined) item.quantity = Number(updates.quantity);
    if (updates.unit !== undefined) item.unit = updates.unit;
    if (updates.storageLocation !== undefined) item.storageLocation = updates.storageLocation;
    if (updates.expiryDate !== undefined) item.expiryDate = updates.expiryDate;
    if (updates.notes !== undefined) item.notes = updates.notes;

    item.updatedAt = new Date();
    await item.save();

    return res.json({
      isSuccess: true,
      message: 'Item updated successfully.',
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

const leaveKitchen = async (req, res) => {
  const { kitchenId } = req.params;
  const userId = req.user?.Id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ isSuccess: false, message: 'User not found.' });
    }

    if (user.kitchenId !== kitchenId) {
      return res
        .status(400)
        .json({ isSuccess: false, message: 'You are not a member of this kitchen.' });
    }

    const kitchen = await Kitchen.findOne({ kitchenId });
    if (kitchen) {
      kitchen.members = (kitchen.members || []).filter(
        (m) => m !== user._id.toString() && m !== user.userEmail
      );
      kitchen.updatedAt = new Date();
      await kitchen.save();

      // If no members left in the kitchen, delete the kitchen and its items
      const remainingUsers = await User.countDocuments({ kitchenId });
      if (remainingUsers <= 1) {
        await KitchenItem.deleteMany({ kitchenId });
        await ShoppingItem.deleteMany({ kitchenId });
        await Kitchen.findOneAndDelete({ kitchenId });
      }
    }

    // Completely delete the user account from MongoDB (login data, gmail, profile)
    await User.findByIdAndDelete(userId);

    // Clear authentication cookie so the user is logged out immediately
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    return res.json({
      isSuccess: true,
      message: 'You have exited the kitchen and your account data has been completely deleted. You can sign up fresh anytime.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

const deleteWholeKitchen = async (req, res) => {
  const { kitchenId } = req.params;
  const userId = req.user?.Id;
  const { password, phoneNumber } = req.body || {};

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ isSuccess: false, message: 'User not found.' });
    }

    const kitchen = await Kitchen.findOne({ kitchenId });
    if (!kitchen) {
      return res.status(404).json({ isSuccess: false, message: 'Kitchen not found.' });
    }

    const isCreator =
      kitchen.createdBy === user.userEmail || kitchen.createdBy === user._id.toString();
    const isAdmin = user.role === 'KitchenAdmin';

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        isSuccess: false,
        message: 'Permission denied. Only Kitchen Admins can delete the kitchen.'
      });
    }

    // Verify Admin Password and Phone Number
    const verification = await verifyAdminCredentials(user, password, phoneNumber);
    if (!verification.isValid) {
      return res.status(401).json({
        isSuccess: false,
        message: verification.message
      });
    }

    // 1. Delete all items in kitchen
    await KitchenItem.deleteMany({ kitchenId });

    // 2. Delete all shopping items in kitchen
    await ShoppingItem.deleteMany({ kitchenId });

    // 3. Permanently delete all user accounts belonging to this kitchen so they can signup fresh
    await User.deleteMany({ kitchenId });

    // 4. Delete the kitchen document itself
    await Kitchen.findOneAndDelete({ kitchenId });

    // 5. Clear authentication cookie for admin
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    return res.json({
      isSuccess: true,
      message:
        'Kitchen, inventory products, shopping lists, and all member accounts have been permanently deleted.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

const removeMemberFromKitchen = async (req, res) => {
  const { kitchenId, targetUserId } = req.params;
  const requesterId = req.user?.Id;
  const { password, phoneNumber } = req.body || {};

  try {
    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ isSuccess: false, message: 'Admin user not found.' });
    }

    const kitchen = await Kitchen.findOne({ kitchenId });
    if (!kitchen) {
      return res.status(404).json({ isSuccess: false, message: 'Kitchen not found.' });
    }

    const isCreator =
      kitchen.createdBy === requester.userEmail ||
      kitchen.createdBy === requester._id.toString();
    const isAdmin = requester.role === 'KitchenAdmin';

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        isSuccess: false,
        message: 'Permission denied. Only Kitchen Admins can remove members.'
      });
    }

    if (targetUserId === requesterId || targetUserId === requester._id.toString()) {
      return res.status(400).json({
        isSuccess: false,
        message: 'You cannot remove yourself using this action. Use Exit Kitchen instead.'
      });
    }

    // Verify Admin Password and Phone Number
    const verification = await verifyAdminCredentials(requester, password, phoneNumber);
    if (!verification.isValid) {
      return res.status(401).json({
        isSuccess: false,
        message: verification.message
      });
    }

    const targetUser = await User.findOne({ _id: targetUserId, kitchenId });
    if (!targetUser) {
      return res.status(404).json({
        isSuccess: false,
        message: 'Target member not found in this kitchen.'
      });
    }

    // 1. Remove target from kitchen.members array (handle both ObjectId string and email)
    kitchen.members = kitchen.members.filter(
      (m) =>
        m !== targetUser._id.toString() &&
        m !== targetUser.userEmail &&
        m !== targetUserId
    );
    kitchen.updatedAt = new Date();
    await kitchen.save();

    // 2. Permanently delete target user account (login data, gmail, profile) from MongoDB
    await User.findByIdAndDelete(targetUserId);

    return res.json({
      isSuccess: true,
      message: `${targetUser.userName}'s account and credentials have been permanently deleted from the database.`,
      targetUserId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

const makeMemberAdmin = async (req, res) => {
  const { kitchenId, targetUserId } = req.params;
  const requesterId = req.user?.Id;

  try {
    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ isSuccess: false, message: 'Requester not found.' });
    }

    const kitchen = await Kitchen.findOne({ kitchenId });
    if (!kitchen) {
      return res.status(404).json({ isSuccess: false, message: 'Kitchen not found.' });
    }

    const isCreator =
      kitchen.createdBy === requester.userEmail ||
      kitchen.createdBy === requester._id.toString();
    const isAdmin = requester.role === 'KitchenAdmin';

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        isSuccess: false,
        message: 'Permission denied. Only Kitchen Admins can promote other members.'
      });
    }

    const targetUser = await User.findOne({ _id: targetUserId, kitchenId });
    if (!targetUser) {
      return res.status(404).json({
        isSuccess: false,
        message: 'Target member not found in this kitchen.'
      });
    }

    targetUser.role = 'KitchenAdmin';
    await targetUser.save();

    return res.json({
      isSuccess: true,
      message: `${targetUser.userName} is now a Kitchen Admin.`,
      data: {
        _id: targetUser._id.toString(),
        userName: targetUser.userName,
        userEmail: targetUser.userEmail,
        role: targetUser.role,
        phoneNumber: targetUser.phoneNumber,
        createdAt: targetUser.createdAt
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

export default {
  addItemsToKitchen,
  addShoppingItemsToKitchen,
  getKitchen,
  getAllKitchenItemsByKitchenId,
  getKitchenMembers,
  deleteKitchenItem,
  updateKitchenItem,
  getAllShoppingItemsByKitchenId,
  toggleShoppingItemBought,
  deleteShoppingItem,
  leaveKitchen,
  deleteWholeKitchen,
  removeMemberFromKitchen,
  makeMemberAdmin
};
