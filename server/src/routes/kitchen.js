import express from 'express';
import kitchenCtrl from '../controllers/kitchenController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/kitchen/:kitchenId/:Id', authMiddleware, kitchenCtrl.getKitchen);

router.get('/kitchenItems/:kitchenId', authMiddleware, kitchenCtrl.getAllKitchenItemsByKitchenId);

router.get('/members/:kitchenId', authMiddleware, kitchenCtrl.getKitchenMembers);

router.post('/addItems/:kitchenId', authMiddleware, kitchenCtrl.addItemsToKitchen);

router.post('/addShoppingItems/:kitchenId', authMiddleware, kitchenCtrl.addShoppingItemsToKitchen);

router.get('/shoppingItems/:kitchenId', authMiddleware, kitchenCtrl.getAllShoppingItemsByKitchenId);

router.patch('/shoppingItem/:kitchenId/:itemId/toggle', authMiddleware, kitchenCtrl.toggleShoppingItemBought);

router.delete('/shoppingItem/:kitchenId/:itemId', authMiddleware, kitchenCtrl.deleteShoppingItem);

router.put('/kitchen/:kitchenId/item/:itemId', authMiddleware, kitchenCtrl.updateKitchenItem);

router.delete('/kitchen/:kitchenId/item/:itemId', authMiddleware, kitchenCtrl.deleteKitchenItem);

export default router;
