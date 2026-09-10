import express from 'express';
import kitchenCtrl from '../controllers/kitchenController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/kitchen/:kitchenId/:Id', authMiddleware, kitchenCtrl.getKitchen);

router.get('/kitchenItems/:kitchenId', authMiddleware, kitchenCtrl.getAllKitchenItemsByKitchenId);

router.post('/addItems/:kitchenId', authMiddleware, kitchenCtrl.addItemsToKitchen);

router.post('/addShoppingItems/:kitchenId', authMiddleware, kitchenCtrl.addShoppingItemsToKitchen);

router.delete('/kitchen/:kitchenId/item/:itemId', kitchenCtrl.deleteKitchenItem);

export default router;
