import { useState } from "react"
import { LuChefHat } from "react-icons/lu"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../stores/store"
import { registerToKitchen } from "../stores/slices/AuthSlice"

export type RegisterOtherUserType = {
     userName : string,
        userEmail : string,
        userPassword : string,
        kitchenName : string,
        kitchenId : string,
        phoneNumber : string
}

const RegisterToKitchen = () => {


     const dispatch = useDispatch<AppDispatch>();
     //const navigate = useNavigate()
  const { loading, error, message } = useSelector((state: RootState) => state.auth);
    const [inputData,setInputData] = useState<RegisterOtherUserType>({
        userName : "",
        userEmail : "",
        userPassword : "",
        kitchenName : "",
        kitchenId : "",
        phoneNumber : ""
    });

    const handleInputData = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputData(prev => ({...prev, [e.target.name]: e.target.value}))
            console.log(inputData)
    }

      const handleForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(registerToKitchen(inputData));
  }
console.log(message)

    return (
        <div className="bg-gray-200 flex justify-center items-center">
            <div className="flex items-center flex-col bg-white px-10 my-3 py-5 w-[730px] rounded-xl shadow-xl">
                <div className="text-4xl bg-green-200 rounded-[100%] text-green-600 p-3 mb-3">
                    <LuChefHat />
                </div>

                <h2 className="text-3xl font-bold">Join CookTrack</h2>

                <p className="opacity-80 text-sm pb-1">Add yourself to existing kitchen with kitchen id and name</p>

                <div className="w-full">
                    <form className="space-y-4" onSubmit={handleForm}>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="name">Full Name</label>
                            <input type="text" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your name" name="userName" onChange={handleInputData}/>
                        </div>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="email">Email Address</label>
                            <input type="email" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your email" onChange={handleInputData} name="userEmail" />
                        </div>

<div className="flex w-full gap-x-5">
                        <div className="flex flex-col space-y-2 w-full">
                            <label className="font-medium" htmlFor="email">Password</label>
                            <input type="password" className=" bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your password" onChange={handleInputData} name="userPassword"/>
                        </div>

                        <div className="flex flex-col space-y-2 w-full">
                            <label className="font-medium" htmlFor="email">Confirm Password</label>
                            <input type="password" className=" bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your password"  name="userPassword"/>
                        </div>
</div>
                        
                   <div className="flex flex-col space-y-2">
                            <label className="font-medium" htmlFor="name">Kitchen Id</label>
                            <input type="text" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your kitchen Id Provided by Kitchen Admin" onChange={handleInputData} name="kitchenId"/>
                        </div>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="name">Kitchen Name</label>
                            <input type="text" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your kitchen Name Provided by Kitchen Admin" onChange={handleInputData} name="kitchenName"/>
                        </div>
                        

                        

                         <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="name">Phone Number</label>
                            <input type="text" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your phone number" onChange={handleInputData} name="phoneNumber" />
                            
                        </div>

                        {/* Feedback */}
            {loading && (
              <p className="text-blue-500 text-sm">Registering...</p>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {/* {message && <p className="text-green-600 text-sm">{message}</p>} */}


                      
                            <button className="bg-green-500 rounded-lg py-1.5 focus:border-black font-medium text-center w-full mt-2" type="submit">Sign In</button>
                        
                    </form>
                </div>
            </div>

        </div>
    )
}

export default RegisterToKitchen