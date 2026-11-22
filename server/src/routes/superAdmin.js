import express from 'express';
import { superAdminAuth } from '../middleware/superAdminAuth.js';
import {
  getPlatformStats,
  getAllKitchens,
  inspectKitchen,
  deleteKitchenAsSuperAdmin,
  getAllUsers,
  toggleUserSuspension,
  updateUserRole,
  getAuditLogs,
  getPlatformSettings,
  updatePlatformSettings,
  triggerSystemCleanup,
  getPublicAnnouncement,
} from '../controllers/superAdminController.js';

const router = express.Router();

// Public announcement route (no auth)
router.get('/announcement/public', getPublicAnnouncement);

// Protected routes (Super Admin only)
router.use(superAdminAuth);

router.get('/stats', getPlatformStats);
router.get('/kitchens', getAllKitchens);
router.get('/kitchens/:kitchenId', inspectKitchen);
router.delete('/kitchens/:kitchenId', deleteKitchenAsSuperAdmin);

router.get('/users', getAllUsers);
router.patch('/users/:userId/suspend', toggleUserSuspension);
router.patch('/users/:userId/role', updateUserRole);

router.get('/logs', getAuditLogs);
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);
router.post('/cleanup', triggerSystemCleanup);

export { getPublicAnnouncement };
export default router;
