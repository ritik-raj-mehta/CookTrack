
import { useState } from "react"
import { LuChefHat } from "react-icons/lu"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../stores/store"
import { register } from "../stores/slices/AuthSlice"
import { useNavigate } from "react-router-dom"

export type SignUpType = {
    userName: string,
    userEmail: string,
    userPassword: string,
    kitchenName: string,
    phoneNumber: string
}

const SignUp = () => {


    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate()
    const { loading, error, message } = useSelector((state: RootState) => state.auth);
    const [inputData, setInputData] = useState<SignUpType>({
        userName: "",
        userEmail: "",
        userPassword: "",
        kitchenName: "",
        phoneNumber: ""
    });

    const handleInputData = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        console.log(inputData)
    }

    // const handleForm = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     dispatch(register(inputData));
    // }
    const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    await dispatch(register(inputData)).unwrap(); // wait for success
    navigate("/signin"); // only runs if register was successful
  } catch (err) {
    // error case – do nothing, error from slice will be shown on UI
    console.error("Registration failed:", err);
  }
};
    console.log(message)

//     useEffect(() => {
//   // Run this effect whenever loading or message changes
//   if (!loading && message === "User registered successfully") {
//     navigate("/signin");
//   }
//   // If there's an error, we just stay on this page and show the error message
// }, [loading, message, navigate]);


    return (
        <div className="bg-gray-200 flex justify-center items-center">
            <div className="flex items-center flex-col bg-white px-10 my-3 py-5 w-[530px] rounded-xl shadow-xl">
                <div className="text-4xl bg-green-200 rounded-[100%] text-green-600 p-3 mb-3">
                    <LuChefHat />
                </div>

                <h2 className="text-3xl font-bold">Join CookTrack</h2>

                <p className="opacity-80 text-sm pb-3">Create your account to start managing your kitchen inventory efficiently</p>

                <div className="w-full">
                    <form className="space-y-4" onSubmit={handleForm}>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="name">Full Name</label>
                            <input type="text" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your name" name="userName" onChange={handleInputData} />
                        </div>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="email">Email Address</label>
                            <input type="email" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your email" onChange={handleInputData} name="userEmail" />
                        </div>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="email">Password</label>
                            <input type="password" className=" bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your password" onChange={handleInputData} name="userPassword" />
                        </div>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="email">Confirm Password</label>
                            <input type="password" className=" bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your password" name="userPassword" />
                        </div>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="name">Kitchen Name</label>
                            <input type="text" className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your kitchen name" onChange={handleInputData} name="kitchenName" />
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
                        {message && <p className="text-green-600 text-sm">{message}</p>}


                        <div >
                            <button className="bg-green-500 rounded-lg py-1.5 focus:border-black font-medium text-center w-full" type="submit">Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    )
}

export default SignUp