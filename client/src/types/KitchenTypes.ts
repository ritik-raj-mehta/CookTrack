export type ProductTypes = {
    category : string
    expiryDate : string
    notes : string
    productName : string
    quantity : number
    storageLocation : string
    unit : string
    productId? : string
}


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
  productName: string,
  category: string,
  quantity: number
  unit: string
  storageLocation: string
  expiryDate: string
  notes: string
}