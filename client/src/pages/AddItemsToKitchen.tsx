import { useState } from "react"
import { FiCodesandbox } from "react-icons/fi"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../stores/store"
import { addKitchenItems } from "../stores/slices/KitchenSlice"
import type { ItemsTypes } from "../types/KitchenTypes"


const AddItemsToKitchen = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [kitchenItems, setKitchenItems] = useState<ItemsTypes>({
    productName: "",
    category: "",
    quantity: 0,
    unit: "",
    storageLocation: "",
    expiryDate: "",
    notes: "",
  })

  const handleProductFormData = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKitchenItems(prev => ({
      ...prev,
      [name]: name === "quantity" ? (value === "" ? 0 : Number(value)) : value
    }));
  }

  const handleKitchenItemForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!kitchenItems.productName) return;
    await dispatch(addKitchenItems(kitchenItems));
    setKitchenItems({
      productName: "",
      category: "",
      quantity: 0,
      unit: "Pieces",
      storageLocation: "",
      expiryDate: "",
      notes: "",
    });
  }

  return (
    <div className="bg-gray-100 w-full">
      <div className="bg-white py-3 border-b border-black/10 px-8">

        <div className="flex gap-x-4">
          <div className="bg-green-200 text-2xl p-2 rounded-[100%] items-center my-auto text-green-800">
            <FiCodesandbox />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-amber-950">Add new product</h1>
            <p className="text-lg font-medium opacity-85">Add items to your kitchen inventory</p>
          </div>
        </div>

      </div>

      <div className="flex justify-center items-center flex-col py-11.5 ">
        <form onSubmit={handleKitchenItemForm} className="w-[600px] bg-white p-8 flex justify-center flex-col rounded-xl gap-y-5 shadow-xl">

          <div>
            <h3 className="text-2xl font-semibold">Product Information</h3>
            <p className="opacity-60 font-medium text-sm">Fill in the details about the product you want to add to your inventory</p>
          </div>

          <div className="flex gap-x-5 w-full justify-center">
            <div className="flex flex-col space-y-2 w-full">
              <label className="font-medium" htmlFor="name">Product Name</label>
              <input type="text" name="productName" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your product name" onChange={handleProductFormData} value={kitchenItems.productName} />
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <label className="font-medium" htmlFor="name">Category</label>
              <select name="category" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" onChange={handleProductFormData} value={kitchenItems.category}>
                <option value="">Select Category</option>
                <option value="Fruits & Vegetable">Fruits & Vegetable</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
                <option value="Seafood">Seafood</option>
                <option value="Pantry Items">Pantry Items</option>
                <option value="Frozen Fruits">Frozen Fruits</option>
                <option value="Bevarages">Bevarages</option>
                <option value="Snacks">Snacks</option>
                <option value="Condiment & Sauces">Condiment & Sauces</option>
                <option value="Baking Supplies">Baking Supplies</option>
              </select>

            </div>
          </div>


          <div className="flex gap-x-5 w-full justify-center">
            <div className="flex flex-col space-y-2 w-full">
              <label className="font-medium" htmlFor="quantity">Quantity</label>
              <input name="quantity" type="number" min="0" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter quantity" onChange={handleProductFormData} value={kitchenItems.quantity || ""} />
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <label className="font-medium" htmlFor="unit">Unit</label>
              <select name="unit" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" onChange={handleProductFormData} value={kitchenItems.unit}>
                <option value="">Select Unit</option>
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

          <div className="flex gap-x-5 w-full justify-center">
            <div className="flex flex-col space-y-2 w-full">
              <label className="font-medium" htmlFor="storageLocation">Storage Location</label>
              <select name="storageLocation" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" onChange={handleProductFormData} value={kitchenItems.storageLocation}>
                <option value="">Select Location</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Freezer">Freezer</option>
                <option value="Pantry">Pantry</option>
                <option value="Cupboard">Cupboard</option>
                <option value="Counter">Counter</option>
                <option value="Spice Rack">Spice Rack</option>
                <option value="Wine Rack">Wine Rack</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <label className="font-medium" htmlFor="expiryDate">Expiry Date</label>
              <input name="expiryDate" type="date" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" onChange={handleProductFormData} value={kitchenItems.expiryDate} />
            </div>
          </div>

          <div className="flex flex-col space-y-2 w-full">
            <label className="font-medium" htmlFor="notes">Notes</label>
            <textarea className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Any additional notes about this product..." name="notes" onChange={handleProductFormData} value={kitchenItems.notes}>
            </textarea>
          </div>

          <div className="space-x-6 pt-3 flex items-center">
            <button className="bg-green-500 text-center w-[420px] py-2 rounded-lg text-white font-semibold hover:bg-green-600 cursor-pointer" type="submit">Add Product</button>
            <button type="button" className="bg-gray-100 text-orange-600 border-orange-500/60 border py-2 px-5 rounded-lg font-semibold hover:bg-orange-50 cursor-pointer" onClick={() => setKitchenItems({
              productName: "",
              category: "",
              quantity: 0,
              unit: "",
              storageLocation: "",
              expiryDate: "",
              notes: "",
            })}>Cancel</button>
          </div>


        </form>
      </div>
    </div>
  )
}

export default AddItemsToKitchen
