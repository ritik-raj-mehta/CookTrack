import { useState } from "react"
import { FiCodesandbox } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../stores/store"
import { addItemsToShoppingCart } from "../stores/slices/KitchenSlice"

export type shoppingItemTypes = {
  name: string;
  neededQuantity: number;
  unit: string;
  notes: string;
};

const AddItemsToShoppingCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, message, error } = useSelector((state: RootState) => state.kitchen);
  const [kitchenItems, setKitchenItems] = useState<shoppingItemTypes>({
    name: "",
    neededQuantity: 0,
    unit: "Pieces",
    notes: "",
  });

  const handleProductFormData = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setKitchenItems(prev => ({
      ...prev,
      [name]: name === "neededQuantity" ? (value === "" ? 0 : Number(value)) : value
    }));
  };

  const handleKitchenItemForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!kitchenItems.name) return;
    await dispatch(addItemsToShoppingCart(kitchenItems));
    setKitchenItems({
      name: "",
      neededQuantity: 0,
      unit: "Pieces",
      notes: "",
    });
  };

  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <div className="bg-white py-3 border-b border-black/10 px-8">
        <div className="flex gap-x-4 items-center">
          <div className="bg-green-200 text-2xl p-2 rounded-full text-green-800">
            <FiCodesandbox />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-amber-950">Add Shopping Item</h1>
            <p className="text-sm font-medium opacity-85">Add items needed for your kitchen shopping list</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center flex-col py-10 px-4">
        <form onSubmit={handleKitchenItemForm} className="w-full max-w-[600px] bg-white p-8 flex flex-col rounded-xl gap-y-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-semibold">Shopping Item Information</h3>
            <p className="opacity-60 font-medium text-sm">Fill in the details about the item you need to buy</p>
          </div>

          {message && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

          <div className="flex flex-col space-y-2 w-full">
            <label className="font-medium" htmlFor="name">Product Name</label>
            <input
              type="text"
              name="name"
              required
              className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-2"
              placeholder="e.g. Milk, Eggs, Rice"
              onChange={handleProductFormData}
              value={kitchenItems.name}
            />
          </div>

          <div className="flex gap-x-5 w-full">
            <div className="flex flex-col space-y-2 w-full">
              <label className="font-medium" htmlFor="neededQuantity">Needed Quantity</label>
              <input
                name="neededQuantity"
                type="number"
                min="0"
                className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-2"
                placeholder="Enter quantity"
                onChange={handleProductFormData}
                value={kitchenItems.neededQuantity || ""}
              />
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <label className="font-medium" htmlFor="unit">Unit</label>
              <select
                name="unit"
                className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-2"
                onChange={handleProductFormData}
                value={kitchenItems.unit}
              >
                <option value="Pieces">Pieces</option>
                <option value="kg">kg</option>
                <option value="grams">grams</option>
                <option value="liters">liters</option>
                <option value="ml">ml</option>
                <option value="cups">cups</option>
                <option value="cans">cans</option>
                <option value="bottles">bottles</option>
                <option value="package">package</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col space-y-2 w-full">
            <label className="font-medium" htmlFor="notes">Notes</label>
            <textarea
              className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-2"
              placeholder="Any brand preferences or shopping notes..."
              name="notes"
              rows={3}
              onChange={handleProductFormData}
              value={kitchenItems.notes}
            />
          </div>

          <div className="space-x-4 pt-3 flex items-center">
            <button
              className="bg-green-500 flex-1 py-2 rounded-lg text-white font-semibold hover:bg-green-600 cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add to Shopping List"}
            </button>
            <button
              type="button"
              className="bg-gray-100 text-orange-600 border border-orange-500/60 py-2 px-6 rounded-lg font-semibold hover:bg-orange-50 cursor-pointer"
              onClick={() => setKitchenItems({
                name: "",
                neededQuantity: 0,
                unit: "Pieces",
                notes: "",
              })}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemsToShoppingCart;
