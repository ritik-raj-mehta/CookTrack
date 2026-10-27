export type ProductTypes = {
  _id?: string;
  category: string;
  expiryDate: string;
  notes: string;
  productName: string;
  quantity: number;
  storageLocation: string;
  unit: string;
  productId?: string;
};

export type KitchenItem = {
  _id: string;
  productName: string;
  quantity: number;
  unit: string;
  category: string;
  createdAt: string;   // ISO date
  updatedAt: string;   // ISO date
  expiryDate?: string; // ISO date, optional
  storageLocation: string;
  notes?: string;
};

export type ItemsTypes = {
  _id?: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  storageLocation: string;
  expiryDate: string;
  notes: string;
  createdAt?: string;
};

export type KitchenMember = {
  _id: string;
  userName: string;
  userEmail: string;
  role: string;
  phoneNumber?: string;
  createdAt: string;
};

export type ShoppingItemInput = {
  name: string;
  neededQuantity: number;
  unit: string;
  notes?: string;
};

export type ShoppingItem = {
  _id: string;
  kitchenId?: string;
  name: string;
  neededQuantity: number;
  unit: string;
  notes?: string;
  isBought?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type KitchenData = {
  _id?: string;
  kitchenName: string;
  kitchenId: string;
  createdBy?: string;
  members?: string[];
  kitchenItemIds?: KitchenItem[];
  kitchenShoppingItemIds?: ShoppingItem[];
};