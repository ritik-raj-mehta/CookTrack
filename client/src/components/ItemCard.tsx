import { FaRegCalendarCheck } from "react-icons/fa"
import { IoLocationOutline } from "react-icons/io5"
import { MdDeleteOutline, MdOutlineModeEdit } from "react-icons/md"
import type { ProductTypes } from "../types/KitchenTypes"

type ProductPropTypes = {
    productData: ProductTypes[]
}

const ItemCard = ({ productData }: ProductPropTypes) => {

    return (
        <div className="grid grid-cols-3  pb-8 place-content-center gap-[30px]">
            {
                productData.map(k => (
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex justify-between ">
                            <h3 className="font-bold text-lg">{k.productName}</h3>
                            {
                                k.quantity > 2 ? (<p className="bg-green-500 px-3 py-0.5 rounded-2xl text-sm font-medium my-auto text-white">In Stock</p>) : (<p className="bg-red-500 px-3 py-0.5 rounded-2xl text-sm font-medium my-auto text-white">Low Stock</p>)
                            }

                        </div>
                        <p className="opacity-70">{k.category}</p>

                        <div className="flex justify-between py-3 pe-10">

                            <div className="space-y-[-5px]">
                                <p className="text-sm opacity-80">Quantity</p>
                                <p className="flex items-center font-medium"><span>{k.quantity} </span>{k.unit}</p>
                            </div>


                            <div className="space-y-[-5px]">
                                <p className="text-sm opacity-80">Location</p>
                                <p className="flex items-center font-medium">
                                    <IoLocationOutline />
                                    {k.storageLocation}</p>
                            </div>

                        </div>

                        <div>
                            <p className="text-sm opacity-80">Expiry Date</p>
                            <p className="flex items-center font-medium gap-2" >
                                <FaRegCalendarCheck />
                                {k.expiryDate}
                            </p>
                        </div>

                        <div className="flex justify-between pt-4 gap-5">
                            <button className="px-12 bg-gray-100 py-1 rounded-lg flex items-center gap-x-2 font-semibold border border-black/20 "><MdOutlineModeEdit />Edit</button>
                            <button className="px-12 bg-gray-100 py-1 rounded-lg flex items-center gap-x-2 text-orange-500 font-semibold border border-black/20"><MdDeleteOutline />Delete</button>
                        </div>

                    </div>
                ))
            }
        </div>
    )
}

export default ItemCard