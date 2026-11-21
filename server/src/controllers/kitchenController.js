import bcrypt from 'bcrypt';
import Kitchen from '../models/Kitchen.js';
import KitchenItem from '../models/KitchenItem.js';
import ShoppingItem from '../models/ShoppingItem.js';
import User from '../models/User.js';
import ItemLog from '../models/ItemLog.js';

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
  const { kitchenId } = req.params;
  const body = req.body || {};

  try {
    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId });
    if (!kitchen) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'Kitchen not exists.' });
    }

    const { productName, category, quantity, unit, storageLocation, expiryDate, notes } = body;
    const item = new KitchenItem({
      kitchenId,
      productName: String(productName || '').trim(),
      category: category ? String(category).trim() : 'Pantry Items',
      quantity: Number(quantity) || 0,
      unit: unit ? String(unit).trim() : 'pcs',
      storageLocation: storageLocation ? String(storageLocation).trim() : 'Pantry',
      expiryDate: expiryDate ? String(expiryDate).trim() : '',
      notes: notes ? String(notes).trim() : ''
    });
    await item.save();

    kitchen.kitchenItemIds.push(item._id);
    kitchen.updatedAt = new Date();
    await kitchen.save();

    // Log restocked event asynchronously
    ItemLog.create({
      kitchenId,
      userId: req.user?.id || null,
      userName: req.user?.userName || 'Crew Member',
      itemId: item._id,
      productName: item.productName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      action: 'restocked',
      notes: 'Restocked into Pantry'
    }).catch((e) => console.error('Restock log error:', e));

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
  const body = req.body || {};

  try {
    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId });
    if (!kitchen) {
      return res.status(404).json({
        isSuccess: false,
        message: "Kitchen doesn't exist."
      });
    }

    const { name, neededQuantity, unit, notes } = body;
    const cleanName = String(name || '').trim();
    if (!cleanName) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Item name is required.'
      });
    }

    // Check if an unbought item with this name already exists in this kitchen
    const escapedName = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await ShoppingItem.findOne({
      kitchenId,
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
      isBought: false
    });

    if (existing) {
      existing.neededQuantity = (existing.neededQuantity || 1) + (Number(neededQuantity) || 1);
      if (notes && !existing.notes) existing.notes = notes;
      existing.updatedAt = new Date();
      await existing.save();

      return res.json({
        isSuccess: true,
        alreadyExists: true,
        message: `"${cleanName}" is already in your shopping list. Quantity increased to ${existing.neededQuantity}.`,
        data: existing
      });
    }

    const shopItem = new ShoppingItem({
      kitchenId,
      name: cleanName,
      neededQuantity: Number(neededQuantity) || 1,
      unit: unit ? String(unit).trim() : 'pcs',
      notes: notes ? String(notes).trim() : '',
      isBought: false
    });
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
    const user = await User.findById(Id).lean();
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
      .populate('kitchenShoppingItemIds')
      .lean();

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
    const data = await KitchenItem.find({ kitchenId: kitchenId })
      .sort({ createdAt: -1 })
      .lean();

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
    const kitchen = await Kitchen.findOne({ kitchenId: kitchenId }).lean();
    if (!kitchen) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'Kitchen not found' });
    }

    const members = await User.find(
      { kitchenId: kitchenId },
      'userName userEmail role phoneNumber createdAt'
    ).lean();

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
    const data = await ShoppingItem.find({ kitchenId: kitchenId })
      .sort({ createdAt: -1 })
      .lean();

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

const updateShoppingItem = async (req, res) => {
  const { kitchenId, itemId } = req.params;
  const updates = req.body || {};

  try {
    const item = await ShoppingItem.findOne({ _id: itemId, kitchenId: kitchenId });
    if (!item) {
      return res.status(404).json({
        isSuccess: false,
        message: 'Shopping item not found.'
      });
    }

    if (updates.name !== undefined) {
      const trimmed = String(updates.name).trim();
      if (!trimmed) {
        return res.status(400).json({
          isSuccess: false,
          message: 'Product name cannot be empty.'
        });
      }
      item.name = trimmed;
    }
    if (updates.neededQuantity !== undefined) item.neededQuantity = Number(updates.neededQuantity) || 1;
    if (updates.unit !== undefined) item.unit = String(updates.unit).trim();
    if (updates.notes !== undefined) item.notes = String(updates.notes).trim();

    item.updatedAt = new Date();
    await item.save();

    return res.json({
      isSuccess: true,
      message: 'Shopping item updated successfully.',
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

const leaveKitchen = async (req, res) => {
  const { kitchenId } = req.params;
  const userId = req.user?.Id;
  const { password } = req.body || {};

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

    // Verify user password before exiting kitchen
    if (!password || !String(password).trim()) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Password is required to exit the kitchen.'
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.userPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        isSuccess: false,
        message: 'Invalid password. Verification failed.'
      });
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

const getKitchenAnalytics = async (req, res) => {
  const { kitchenId } = req.params;

  try {
    // 1. Fetch live items from KitchenItem (.lean())
    const currentItems = await KitchenItem.find({ kitchenId }).lean();

    const now = new Date();
    let totalStockUnits = 0;
    let freshItemsCount = 0;
    let expiringSoonCount = 0; // <= 7 days
    let expiredCount = 0;

    const categoryMap = {};
    const locationMap = {};

    currentItems.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      totalStockUnits += qty;

      const cat = item.category || 'Pantry Items';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;

      const loc = item.storageLocation || 'Pantry';
      locationMap[loc] = (locationMap[loc] || 0) + 1;

      if (item.expiryDate) {
        const expDate = new Date(item.expiryDate);
        if (!isNaN(expDate.getTime())) {
          const diffMs = expDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays < 0) {
            expiredCount += 1;
          } else if (diffDays <= 7) {
            expiringSoonCount += 1;
          } else {
            freshItemsCount += 1;
          }
        } else {
          freshItemsCount += 1;
        }
      } else {
        freshItemsCount += 1;
      }
    });

    // 2. Fetch ItemLogs for this kitchen
    const logs = await ItemLog.find({ kitchenId })
      .sort({ loggedAt: -1 })
      .limit(500)
      .lean();

    let totalConsumed = 0;
    let totalWasted = 0;
    let totalRestocked = 0;
    let totalCostSaved = 0;
    let totalCostWasted = 0;

    const wastedCategoryMap = {};
    const DEFAULT_UNIT_COST = 3.5;

    logs.forEach((log) => {
      const qty = Number(log.quantity) || 1;
      const unitCost = Number(log.estimatedCost) || DEFAULT_UNIT_COST;

      if (log.action === 'consumed') {
        totalConsumed += qty;
        totalCostSaved += qty * unitCost;
      } else if (log.action === 'wasted') {
        totalWasted += qty;
        totalCostWasted += qty * unitCost;
        const cat = log.category || 'Pantry Items';
        wastedCategoryMap[cat] = (wastedCategoryMap[cat] || 0) + qty;
      } else if (log.action === 'restocked') {
        totalRestocked += qty;
      }
    });

    // Ratio & Eco Score
    const totalActivity = totalConsumed + totalWasted;
    let consumedRatio = 100;
    if (totalActivity > 0) {
      consumedRatio = Math.round((totalConsumed / totalActivity) * 100);
    } else if (currentItems.length > 0) {
      consumedRatio = expiredCount === 0
        ? 100
        : Math.round(((currentItems.length - expiredCount) / currentItems.length) * 100);
    }

    let ecoScore = 'A';
    let ecoLabel = 'Great Kitchen Flow';
    if (consumedRatio >= 90) {
      ecoScore = 'A+';
      ecoLabel = 'Eco Champion: Minimal Waste';
    } else if (consumedRatio >= 80) {
      ecoScore = 'A';
      ecoLabel = 'Great Kitchen Flow';
    } else if (consumedRatio >= 65) {
      ecoScore = 'B';
      ecoLabel = 'Moderate Waste: Room to Improve';
    } else {
      ecoScore = 'C';
      ecoLabel = 'High Waste Alert';
    }

    // 3. Past 6 Months Trend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      const y = d.getFullYear();

      const monthLogs = logs.filter((log) => {
        const lDate = new Date(log.loggedAt || log.createdAt);
        return lDate.getFullYear() === y && lDate.getMonth() === d.getMonth();
      });

      let mConsumed = 0;
      let mWasted = 0;
      let mRestocked = 0;

      monthLogs.forEach((l) => {
        const q = Number(l.quantity) || 1;
        if (l.action === 'consumed') mConsumed += q;
        else if (l.action === 'wasted') mWasted += q;
        else if (l.action === 'restocked') mRestocked += q;
      });

      monthlyTrends.push({
        month: mName,
        year: y,
        consumed: mConsumed,
        wasted: mWasted,
        restocked: mRestocked,
        saved: Math.round(mConsumed * DEFAULT_UNIT_COST),
      });
    }

    // Top wasted categories
    const topWastedCategories = Object.entries(wastedCategoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Current category distribution
    const categoryDistribution = Object.entries(categoryMap)
      .map(([category, count]) => ({
        category,
        count,
        percentage: currentItems.length > 0 ? Math.round((count / currentItems.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Storage distribution
    const storageDistribution = Object.entries(locationMap)
      .map(([location, count]) => ({
        location,
        count,
        percentage: currentItems.length > 0 ? Math.round((count / currentItems.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Recent activity list
    const recentActivity = logs.slice(0, 15).map((l) => ({
      _id: l._id,
      productName: l.productName,
      category: l.category,
      quantity: l.quantity,
      unit: l.unit,
      action: l.action,
      userName: l.userName || 'Crew Member',
      loggedAt: l.loggedAt || l.createdAt
    }));

    return res.status(200).json({
      isSuccess: true,
      analytics: {
        inventoryHealth: {
          totalProducts: currentItems.length,
          totalUnits: totalStockUnits,
          freshCount: freshItemsCount,
          expiringSoonCount,
          expiredCount,
          atRiskValue: Math.round((expiringSoonCount + expiredCount) * DEFAULT_UNIT_COST)
        },
        wasteStats: {
          totalConsumed,
          totalWasted,
          totalRestocked,
          consumedRatio,
          moneySaved: Math.round(totalCostSaved),
          moneyWasted: Math.round(totalCostWasted),
          ecoScore,
          ecoLabel
        },
        monthlyTrends,
        topWastedCategories,
        categoryDistribution,
        storageDistribution,
        recentActivity
      }
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to retrieve analytics: ' + err.message
    });
  }
};

const logItemAction = async (req, res) => {
  const { kitchenId, itemId } = req.params;
  const { action, quantityUsed = 1, estimatedCost = 3.5, notes = '' } = req.body;

  if (!['consumed', 'wasted'].includes(action)) {
    return res.status(400).json({
      isSuccess: false,
      message: "Action must be either 'consumed' or 'wasted'."
    });
  }

  try {
    const item = await KitchenItem.findOne({ _id: itemId, kitchenId });
    if (!item) {
      return res.status(404).json({
        isSuccess: false,
        message: 'Kitchen item not found.'
      });
    }

    const qtyToDeduct = Math.max(1, Number(quantityUsed) || 1);
    const remainingQty = Math.max(0, (Number(item.quantity) || 1) - qtyToDeduct);

    // Log the activity
    const newLog = await ItemLog.create({
      kitchenId,
      userId: req.user?.id || null,
      userName: req.user?.userName || 'Crew Member',
      itemId: item._id,
      productName: item.productName,
      category: item.category || 'Pantry Items',
      quantity: qtyToDeduct,
      unit: item.unit || 'Pieces',
      action,
      estimatedCost: Number(estimatedCost) || 3.5,
      notes: notes || `Item marked as ${action}`
    });

    if (remainingQty <= 0) {
      await KitchenItem.findByIdAndDelete(itemId);
      await Kitchen.findOneAndUpdate(
        { kitchenId },
        {
          $pull: { kitchenItemIds: item._id },
          $set: { updatedAt: new Date() }
        }
      );

      return res.status(200).json({
        isSuccess: true,
        message: `Marked "${item.productName}" as ${action}. Item finished!`,
        action,
        remainingQuantity: 0,
        itemRemoved: true,
        log: newLog
      });
    } else {
      item.quantity = remainingQty;
      await item.save();

      return res.status(200).json({
        isSuccess: true,
        message: `Marked ${qtyToDeduct} ${item.unit} of "${item.productName}" as ${action}. (${remainingQty} left)`,
        action,
        remainingQuantity: remainingQty,
        itemRemoved: false,
        log: newLog
      });
    }
  } catch (err) {
    console.error('Log Item Action Error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to record action: ' + err.message
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
  updateShoppingItem,
  deleteShoppingItem,
  leaveKitchen,
  deleteWholeKitchen,
  removeMemberFromKitchen,
  makeMemberAdmin,
  getKitchenAnalytics,
  logItemAction
};
