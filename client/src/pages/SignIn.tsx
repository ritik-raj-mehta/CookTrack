import {  useState } from "react"
import { LuChefHat } from "react-icons/lu"
import { useDispatch, useSelector } from "react-redux"
import { Link, Navigate } from "react-router-dom"
import type { AppDispatch, RootState } from "../stores/store"
import { login } from "../stores/slices/AuthSlice"


export type FormDataType = {
    userEmail: string,
    userPassword: string
}

const SignIn = () => {
    const dispatch = useDispatch<AppDispatch>();

    const  {isAuthenticated , message,user} = useSelector((state: RootState) => state.auth);
    console.log(message,user)
    
    const [formData, setFormData] = useState<FormDataType>({
        userEmail: "",
        userPassword: ""
    });

   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    console.log(formData)
};

    const handleForm = async (e:React.FormEvent<HTMLFormElement>) => {

         e.preventDefault();
         dispatch(login(formData))
           
    }

    if (isAuthenticated) {
    return <Navigate to={"/dashboard"} />;
   }
// else{
//     return <Navigate to={"/"} />;
//     console.log("KI")
//   }
    
    return (
        <div className="flex h-screen justify-center items-center bg-gradient-to-b from-green-600 to-orange-500">
            <div className="p-10 flex items-center flex-col bg-white rounded-xl ">
                <div className="text-4xl bg-green-200 rounded-[100%] text-green-600 p-3 mb-3">
                    <LuChefHat />
                </div>

                <p className="font-bold opacity-80 text-2xl pb-1 text-amber-950">Welcome Back</p>
                <span className="opacity-70 pb-5">Sign in to your Cook Track account to manage your inventary</span>
                <div className="w-full">
                    <form className="space-y-5" onSubmit={handleForm}>
                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="email">Email</label>
                            <input name="userEmail" type="email" onChange={handleInput} className="bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your email" />
                        </div>

                        <div className="flex flex-col space-y-2 ">
                            <label className="font-medium" htmlFor="email">Password</label>
                            <input name="userPassword" onChange={handleInput} type="password" className=" bg-gray-100 border border-black/20 rounded-lg px-3 py-1 outline-none focus:border-green-700 focus:border-3" placeholder="Enter your password" />
                        </div>
                      
                            <button className="bg-green-500 rounded-lg py-1.5 focus:border-black font-medium text-center w-full" type="submit">Sign In</button>
                      
                    </form>
                    <div className="text-center pt-3">
                        <span className="opacity-70">Don't have an account? </span>
                        <Link type="submit" to="/signup" className="font-bold text-green-600">Sign up</Link></div>
                </div>
            </div>
        </div>
    )
}

export default SignIn