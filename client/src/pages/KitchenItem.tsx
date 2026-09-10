// import { NavLink } from "react-router-dom"
// // import ProductCard from "../components/ProductCard"
// import { CiFilter, CiSearch } from "react-icons/ci"
// import { FiCodesandbox } from "react-icons/fi"
// import { useDispatch, useSelector } from "react-redux"
// import type { AppDispatch, RootState } from "../stores/store"
// import { useEffect } from "react"
// import { fetchAllKitchenItemsByKitchenId } from "../stores/slices/KitchenSlice"
// import ItemCard from "../components/ItemCard"


// const KitchenItem = () => {

//     const { kitchenItems, message } = useSelector((state: RootState) => state.kitchen)
//     const dispatch = useDispatch<AppDispatch>()

//     console.log("kitchenItemsData", kitchenItems, message)

//     useEffect(() => {
//         dispatch(fetchAllKitchenItemsByKitchenId())
//     }, [dispatch])



//     return (
//         <div className="w-full bg-gray-100">
//             <div className="bg-white py-2 border-b border-black/10 p-17 space-y-[-5px] flex justify-between items-center ">
//                 <div className="flex gap-3">
//                     <div className="bg-green-200 text-2xl p-2 rounded-[100%] items-center my-auto text-green-800">
//                         <FiCodesandbox />
//                     </div>
//                     <div>

//                         <h1 className="text-3xl font-serif font-semibold text-amber-950">My Products</h1>

//                         <p className="text-lg font-medium opacity-85">Add items to your kitchen inventory</p>
//                     </div>


//                 </div>

//                 <NavLink className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-md font-semibold" to="/addproduct">
//                     + Add Product</NavLink>

//             </div>

//             <div className="px-8">

//                 <div className="bg-white my-8 font-semibold px-5 py-8 rounded-lg space-y-4 shadow-xl">

//                     <div className="flex items-center space-x-2">
//                         <CiFilter className="text-3xl " />
//                         <h3 className="text-2xl">Filter & Search</h3>
//                     </div>

//                     <div className="flex space-x-7">

//                         <div className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-3 w-[850px] flex items-center space-x-2">
//                             <CiSearch />
//                             <input type="text" className="outline-none w-full" placeholder="Search products.." />
//                         </div>

//                         <div className="gap-7 grid grid-cols-2">

//                             <select name="" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-3 ">
//                                 <option value="">All Catogries</option>
//                                 <option value="">Fruits & Vegetable</option>
//                                 <option value="">Dairy & Eggs</option>
//                                 <option value="">Meat & Poultry</option>
//                                 <option value="">Seafood</option>
//                                 <option value="">Pantry Items</option>
//                                 <option value="">Frozen Fruits</option>
//                                 <option value="">Bevarages</option>
//                                 <option value="">Snacks</option>
//                                 <option value="">Condiment & Sauces</option>
//                                 <option value="">Baking Supplies</option>
//                             </select>


//                             <select name="" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-3 ">
//                                 <option value="">All Unit</option>
//                                 <option value="">Pices</option>
//                                 <option value="">kg</option>
//                                 <option value="">grams</option>
//                                 <option value="">liters</option>
//                                 <option value="">ml</option>
//                                 <option value="">cups</option>
//                                 <option value="">Bevarages</option>
//                                 <option value="">cans</option>
//                                 <option value="">bottles</option>
//                                 <option value="">package</option>
//                             </select>
//                         </div>


//                     </div>


//                 </div>

//                 <div className="">

//                     <ItemCard productData={kitchenItems} />

//                 </div>


//             </div>


//         </div>
//     )
// }

// export default KitchenItem

import { NavLink } from "react-router-dom"
import { CiFilter, CiSearch } from "react-icons/ci"
import { FiCodesandbox } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../stores/store"
import { useEffect, useState } from "react"
import { fetchAllKitchenItemsByKitchenId } from "../stores/slices/KitchenSlice"
import ItemCard from "../components/ItemCard"
//import type { KitchenItem } from "../types/KitchenTypes"

const KitchenItem = () => {
  const { kitchenItems, message } = useSelector((state: RootState) => state.kitchen)
  const { kitchenId } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [unitFilter, setUnitFilter] = useState("")

  useEffect(() => {
    if (kitchenId) {
      dispatch(fetchAllKitchenItemsByKitchenId())
    }
  }, [dispatch, kitchenId])

  console.log("kitchenItemsData", kitchenItems, message)

  // ---------- FILTER LOGIC ----------
  const filteredItems = kitchenItems.filter((item: any) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      !categoryFilter || item.category === categoryFilter

    const matchesUnit =
      !unitFilter || item.unit === unitFilter

    return matchesSearch && matchesCategory && matchesUnit
  })

  return (
    <div className="w-full bg-gray-100">
      <div className="bg-white py-2 border-b border-black/10 p-17 space-y-[-5px] flex justify-between items-center ">
        <div className="flex gap-3">
          <div className="bg-green-200 text-2xl p-2 rounded-[100%] items-center my-auto text-green-800">
            <FiCodesandbox />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-amber-950">
              My Kitchen Items
            </h1>
            <p className="text-lg font-medium opacity-85">
              Items in Kitchen Invantary
            </p>
          </div>
        </div>

        <NavLink
          className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-md font-semibold"
          to="/additemstokitchen"
        >
          + Add Product
        </NavLink>
      </div>

      <div className="px-8">
        {/* FILTER BOX */}
        <div className="bg-white my-8 font-semibold px-5 py-8 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center space-x-2">
            <CiFilter className="text-3xl " />
            <h3 className="text-2xl">Filter & Search</h3>
          </div>

          <div className="flex space-x-7">
            {/* Search */}
            <div className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-3 w-[850px] flex items-center space-x-2">
              <CiSearch />
              <input
                type="text"
                className="outline-none w-full"
                placeholder="Search products.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="gap-7 grid grid-cols-2">
              {/* Category Filter */}
              <select
                className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-3 "
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
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

              {/* Unit Filter */}
              <select
                className="bg-gray-100 border border-black/20 rounded-lg px-3 py-2 outline-none focus:border-green-700 focus:border-3 "
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <option value="">All Units</option>
                <option value="pieces">Pieces</option>
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
        </div>

        {/* PRODUCT LIST */}
        <div className="my-6">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              No products match the selected filters.
            </p>
          ) : (
            <ItemCard productData={filteredItems} />
          )}
        </div>
      </div>
    </div>
  )
}

export default KitchenItem
