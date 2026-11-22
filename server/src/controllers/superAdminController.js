import User from '../models/User.js';
import Kitchen from '../models/Kitchen.js';
import KitchenItem from '../models/KitchenItem.js';
import ShoppingItem from '../models/ShoppingItem.js';
import ItemLog from '../models/ItemLog.js';
import Otp from '../models/Otp.js';
import PlatformSetting from '../models/PlatformSetting.js';

/**
 * 1. Get Global Platform Statistics
 */
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalKitchens,
      totalItems,
      totalShoppingItems,
      totalLogs,
      activeUsers24h,
    ] = await Promise.all([
      User.countDocuments(),
      Kitchen.countDocuments(),
      KitchenItem.countDocuments(),
      ShoppingItem.countDocuments(),
      ItemLog.countDocuments(),
      User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    // Storage Location Distribution
    const storageAggregation = await KitchenItem.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$storageLocation', 'pantry'] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const storageDistribution = {
      fridge: 0,
      freezer: 0,
      pantry: 0,
    };
    storageAggregation.forEach((s) => {
      const key = s._id.toLowerCase();
      if (key.includes('fridge')) storageDistribution.fridge += s.count;
      else if (key.includes('freeze')) storageDistribution.freezer += s.count;
      else storageDistribution.pantry += s.count;
    });

    // Food Waste & ₹ Savings Aggregations
    const foodLogsAgg = await ItemLog.aggregate([
      {
        $group: {
          _id: '$action',
          totalCount: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$estimatedCost', 150] } },
        },
      },
    ]);

    let moneySaved = 0;
    let moneyWasted = 0;
    let itemsConsumed = 0;
    let itemsWasted = 0;

    foodLogsAgg.forEach((log) => {
      if (log._id === 'consumed') {
        itemsConsumed = log.totalCount;
        moneySaved = log.totalValue;
      } else if (log._id === 'wasted') {
        itemsWasted = log.totalCount;
        moneyWasted = log.totalValue;
      }
    });

    const totalActions = itemsConsumed + itemsWasted;
    const platformEcoScore = totalActions > 0 ? Math.round((itemsConsumed / totalActions) * 100) : 85;

    // Platform settings
    let settings = await PlatformSetting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await PlatformSetting.create({ key: 'global_settings' });
    }

    return res.status(200).json({
      isSuccess: true,
      stats: {
        totalUsers,
        totalKitchens,
        totalItems,
        totalShoppingItems,
        totalLogs,
        activeUsers24h,
        moneySaved: Math.round(moneySaved),
        moneyWasted: Math.round(moneyWasted),
        itemsConsumed,
        itemsWasted,
        platformEcoScore,
        storageDistribution,
        serverUptime: Math.round(process.uptime()),
        nodeVersion: process.version,
      },
      settings,
    });
  } catch (err) {
    console.error('getPlatformStats error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to retrieve platform telemetry: ' + err.message,
    });
  }
};

/**
 * 2. Get All Kitchens (Fleet Table with Search & Pagination)
 */
export const getAllKitchens = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '15', 10)));
    const search = String(req.query.search || '').trim();

    const query = {};
    if (search) {
      query.$or = [
        { kitchenId: { $regex: search, $options: 'i' } },
        { kitchenName: { $regex: search, $options: 'i' } },
      ];
    }

    const totalKitchens = await Kitchen.countDocuments(query);
    const kitchens = await Kitchen.find(query)
      .populate('kitchenAdminId', 'userName userEmail phoneNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Map kitchen metadata with exact item and member lengths
    const formatted = kitchens.map((k) => ({
      _id: k._id,
      kitchenId: k.kitchenId,
      kitchenName: k.kitchenName,
      admin: k.kitchenAdminId
        ? {
            name: k.kitchenAdminId.userName,
            email: k.kitchenAdminId.userEmail,
            phone: k.kitchenAdminId.phoneNumber,
          }
        : null,
      membersCount: Array.isArray(k.kitchenMembersIds) ? k.kitchenMembersIds.length : 0,
      itemsCount: Array.isArray(k.kitchenItemIds) ? k.kitchenItemIds.length : 0,
      shoppingItemsCount: Array.isArray(k.shoppingItemIds) ? k.shoppingItemIds.length : 0,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    }));

    return res.status(200).json({
      isSuccess: true,
      kitchens: formatted,
      pagination: {
        page,
        limit,
        total: totalKitchens,
        totalPages: Math.ceil(totalKitchens / limit),
      },
    });
  } catch (err) {
    console.error('getAllKitchens error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to fetch kitchens: ' + err.message,
    });
  }
};

/**
 * 3. Deep Inspect Kitchen (Inventory, Cart, Crew & Logs)
 */
export const inspectKitchen = async (req, res) => {
  try {
    const { kitchenId } = req.params;

    const kitchen = await Kitchen.findOne({ kitchenId })
      .populate('kitchenAdminId', 'userName userEmail phoneNumber createdAt')
      .populate('kitchenMembersIds', 'userName userEmail phoneNumber role createdAt')
      .lean();

    if (!kitchen) {
      return res.status(404).json({
        isSuccess: false,
        message: `Kitchen with ID "${kitchenId}" was not found.`,
      });
    }

    const [items, shoppingItems, logs] = await Promise.all([
      KitchenItem.find({ kitchenId }).sort({ createdAt: -1 }).lean(),
      ShoppingItem.find({ kitchenId }).sort({ createdAt: -1 }).lean(),
      ItemLog.find({ kitchenId }).sort({ createdAt: -1 }).limit(30).lean(),
    ]);

    return res.status(200).json({
      isSuccess: true,
      kitchen,
      items,
      shoppingItems,
      logs,
    });
  } catch (err) {
    console.error('inspectKitchen error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to inspect kitchen: ' + err.message,
    });
  }
};

/**
 * 4. Delete Kitchen as Super Admin (Clean Purge)
 */
export const deleteKitchenAsSuperAdmin = async (req, res) => {
  try {
    const { kitchenId } = req.params;

    const kitchen = await Kitchen.findOne({ kitchenId });
    if (!kitchen) {
      return res.status(404).json({
        isSuccess: false,
        message: 'Kitchen not found.',
      });
    }

    // Cascade delete all child entities
    await Promise.all([
      KitchenItem.deleteMany({ kitchenId }),
      ShoppingItem.deleteMany({ kitchenId }),
      ItemLog.deleteMany({ kitchenId }),
      User.updateMany({ kitchenId }, { $set: { kitchenId: '', role: 'User' } }),
      Kitchen.deleteOne({ _id: kitchen._id }),
    ]);

    return res.status(200).json({
      isSuccess: true,
      message: `Kitchen "${kitchen.kitchenName}" (${kitchenId}) and all associated items were purged.`,
    });
  } catch (err) {
    console.error('deleteKitchenAsSuperAdmin error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to delete kitchen: ' + err.message,
    });
  }
};

/**
 * 5. Get All Users (Directory Table)
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '15', 10)));
    const search = String(req.query.search || '').trim();
    const roleFilter = String(req.query.role || '').trim();

    const query = {};
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { kitchenId: { $regex: search, $options: 'i' } },
      ];
    }
    if (roleFilter && roleFilter !== 'all') {
      query.role = roleFilter;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-userPassword -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      isSuccess: true,
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to fetch users: ' + err.message,
    });
  }
};

/**
 * 6. Toggle User Suspension
 */
export const toggleUserSuspension = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ isSuccess: false, message: 'User not found.' });
    }

    // Prevent suspending self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        isSuccess: false,
        message: 'You cannot suspend your own Super Admin account.',
      });
    }

    user.isSuspended = !user.isSuspended;
    if (user.isSuspended) {
      user.refreshToken = null; // Invalidate refresh session
    }
    await user.save();

    return res.status(200).json({
      isSuccess: true,
      message: `User ${user.userEmail} is now ${user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}.`,
      isSuspended: user.isSuspended,
    });
  } catch (err) {
    console.error('toggleUserSuspension error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to toggle user suspension: ' + err.message,
    });
  }
};

/**
 * 7. Update User Role (Promote / Demote)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['User', 'KitchenAdmin', 'SuperAdmin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        isSuccess: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ isSuccess: false, message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      isSuccess: true,
      message: `User ${user.userEmail} role updated to "${role}".`,
      user: {
        _id: user._id,
        userEmail: user.userEmail,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('updateUserRole error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to update user role: ' + err.message,
    });
  }
};

/**
 * 8. Get Platform Audit Logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '25', 10)));
    const action = String(req.query.action || '').trim();

    const query = {};
    if (action && action !== 'all') {
      query.action = action;
    }

    const totalLogs = await ItemLog.countDocuments(query);
    const logs = await ItemLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      isSuccess: true,
      logs,
      pagination: {
        page,
        limit,
        total: totalLogs,
        totalPages: Math.ceil(totalLogs / limit),
      },
    });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to retrieve audit logs: ' + err.message,
    });
  }
};

/**
 * 9. Get Platform Settings
 */
export const getPlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSetting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await PlatformSetting.create({ key: 'global_settings' });
    }
    return res.status(200).json({ isSuccess: true, settings });
  } catch (err) {
    return res.status(500).json({ isSuccess: false, message: err.message });
  }
};

/**
 * 10. Update Platform Settings (Announcements & Maintenance)
 */
export const updatePlatformSettings = async (req, res) => {
  try {
    const { announcementText, announcementActive, announcementLevel, maintenanceMode } = req.body;

    let settings = await PlatformSetting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new PlatformSetting({ key: 'global_settings' });
    }

    if (announcementText !== undefined) settings.announcementText = String(announcementText);
    if (announcementActive !== undefined) settings.announcementActive = Boolean(announcementActive);
    if (announcementLevel !== undefined) settings.announcementLevel = announcementLevel;
    if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);
    settings.updatedBy = req.user.userEmail || 'SuperAdmin';

    await settings.save();

    return res.status(200).json({
      isSuccess: true,
      message: 'Platform settings updated successfully.',
      settings,
    });
  } catch (err) {
    console.error('updatePlatformSettings error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to update platform settings: ' + err.message,
    });
  }
};

/**
 * 11. Trigger Database Prune & Cleanup
 */
export const triggerSystemCleanup = async (req, res) => {
  try {
    // 1. Prune expired OTPs older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const otpResult = await Otp.deleteMany({ createdAt: { $lt: tenMinutesAgo } });

    // 2. Find all valid kitchenIds
    const validKitchens = await Kitchen.find().select('kitchenId').lean();
    const validIdsSet = new Set(validKitchens.map((k) => k.kitchenId));

    // 3. Clean orphaned items
    const allItems = await KitchenItem.find().select('kitchenId').lean();
    const orphanedItemIds = allItems
      .filter((i) => !validIdsSet.has(i.kitchenId))
      .map((i) => i._id);

    let itemsDeleted = 0;
    if (orphanedItemIds.length > 0) {
      const itemRes = await KitchenItem.deleteMany({ _id: { $in: orphanedItemIds } });
      itemsDeleted = itemRes.deletedCount;
    }

    return res.status(200).json({
      isSuccess: true,
      message: 'System cleanup completed.',
      summary: {
        expiredOtpsPruned: otpResult.deletedCount,
        orphanedItemsPruned: itemsDeleted,
      },
    });
  } catch (err) {
    console.error('triggerSystemCleanup error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'System cleanup failed: ' + err.message,
    });
  }
};

/**
 * 12. Public Announcement Endpoint (For all frontend users)
 */
export const getPublicAnnouncement = async (req, res) => {
  try {
    const settings = await PlatformSetting.findOne({ key: 'global_settings' }).lean();
    if (!settings || !settings.announcementActive || !settings.announcementText) {
      return res.status(200).json({ isSuccess: true, hasAnnouncement: false });
    }

    return res.status(200).json({
      isSuccess: true,
      hasAnnouncement: true,
      announcement: {
        text: settings.announcementText,
        level: settings.announcementLevel || 'info',
        maintenanceMode: settings.maintenanceMode || false,
      },
    });
  } catch (err) {
    return res.status(200).json({ isSuccess: true, hasAnnouncement: false });
  }
};
