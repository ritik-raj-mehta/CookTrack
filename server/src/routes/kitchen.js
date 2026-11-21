import express from 'express';
import kitchenCtrl from '../controllers/kitchenController.js';
import { authMiddleware, verifyKitchenAccess } from '../middleware/auth.js';

const router = express.Router();

// Apply authMiddleware globally to all kitchen routes
router.use(authMiddleware);

// Apply verifyKitchenAccess to ensure cross-kitchen authorization
router.get('/kitchen/:kitchenId/:Id', verifyKitchenAccess, kitchenCtrl.getKitchen);

router.get('/kitchenItems/:kitchenId', verifyKitchenAccess, kitchenCtrl.getAllKitchenItemsByKitchenId);

router.get('/members/:kitchenId', verifyKitchenAccess, kitchenCtrl.getKitchenMembers);

router.post('/addItems/:kitchenId', verifyKitchenAccess, kitchenCtrl.addItemsToKitchen);

router.post('/addShoppingItems/:kitchenId', verifyKitchenAccess, kitchenCtrl.addShoppingItemsToKitchen);

router.get('/shoppingItems/:kitchenId', verifyKitchenAccess, kitchenCtrl.getAllShoppingItemsByKitchenId);

router.patch('/shoppingItem/:kitchenId/:itemId/toggle', verifyKitchenAccess, kitchenCtrl.toggleShoppingItemBought);

router.put('/shoppingItem/:kitchenId/:itemId', verifyKitchenAccess, kitchenCtrl.updateShoppingItem);

router.delete('/shoppingItem/:kitchenId/:itemId', verifyKitchenAccess, kitchenCtrl.deleteShoppingItem);

router.put('/kitchen/:kitchenId/item/:itemId', verifyKitchenAccess, kitchenCtrl.updateKitchenItem);

router.delete('/kitchen/:kitchenId/item/:itemId', verifyKitchenAccess, kitchenCtrl.deleteKitchenItem);

router.post('/leave/:kitchenId', verifyKitchenAccess, kitchenCtrl.leaveKitchen);

router.delete('/deleteKitchen/:kitchenId', verifyKitchenAccess, kitchenCtrl.deleteWholeKitchen);
router.post('/deleteKitchen/:kitchenId', verifyKitchenAccess, kitchenCtrl.deleteWholeKitchen);

router.post('/removeMember/:kitchenId/:targetUserId', verifyKitchenAccess, kitchenCtrl.removeMemberFromKitchen);
router.delete('/removeMember/:kitchenId/:targetUserId', verifyKitchenAccess, kitchenCtrl.removeMemberFromKitchen);

router.patch('/makeAdmin/:kitchenId/:targetUserId', verifyKitchenAccess, kitchenCtrl.makeMemberAdmin);

router.get('/analytics/:kitchenId', verifyKitchenAccess, kitchenCtrl.getKitchenAnalytics);
router.post('/item-action/:kitchenId/:itemId', verifyKitchenAccess, kitchenCtrl.logItemAction);

export default router;
