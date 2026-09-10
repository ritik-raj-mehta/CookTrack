import { FaArrowRightLong } from "react-icons/fa6"
import { LuChefHat } from "react-icons/lu"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { type AppDispatch, type RootState, persistor } from "../stores/store"
import { logout } from "../stores/slices/AuthSlice"



const Header = () => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated ,loading, role } = useSelector((state: RootState) => state.auth)
  console.log(loading)
  console.log(role);
  const handleLogout = async () => {
    try {
      console.log("🔓 Starting logout...");
      const result = await dispatch(logout()).unwrap();
      console.log("✅ Logout successful:", result);
      
      // Purge Redux Persist store to clear all persisted data
      console.log("🗑️ Purging Redux Persist...");
      await persistor.purge();
      console.log("✅ Redux Persist purged");
      
      console.log("🏠 Navigating to home...");
      navigate("/");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force logout anyway
      await persistor.purge();
      navigate("/");
    }
  }

  return (
    <div className="py-5 flex justify-between pb-10">

      <div className=" flex items-center space-x-2 ">
        <div className="bg-green-400 rounded-2xl text-white p-2 text-4xl">
          <LuChefHat />
        </div>

        <p className="text-2xl font-bold font-serif">CookTrack</p>
      </div>

      {
        isAuthenticated && role === "KitchenAdmin" ?
          (<div className="space-x-4 flex">

            <NavLink className="bg-amber-50 border border-orange-500/70 py-2 px-3 rounded-lg my-auto text-orange-600 font-semibold hover:bg-orange-400 hover:text-black" to="/dashboard" >Kitchen</NavLink>

            <button className="font-semibold  py-2 px-3 rounded-lg bg-red-500 text-white hover:bg-red-600 my-2" onClick={handleLogout}>Sign Out</button>
          </div>) : (<div className="flex gap-x-5">
            <Link to="/signin" className="font-semibold hover:bg-amber-100 py-2 px-3 rounded-lg hover:shadow-2xl my-2">Sign In</Link>
            <Link to="/signup" className="flex gap-3 items-center bg-green-500 py-3 my-auto px-4 rounded-lg font-bold text-white">Get Started <FaArrowRightLong />
            </Link>
          </div>)
      }

    </div>
  )
}

export default Header