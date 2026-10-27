import { FaArrowRightLong } from "react-icons/fa6"
import Header from "../components/Header"
import kitchenhero from "../assets/kitchen-hero.jpg"
import { FiCodesandbox } from "react-icons/fi"
import { FaRegClock } from "react-icons/fa"
import { MdOutlineFamilyRestroom } from "react-icons/md"
import { Link } from "react-router-dom"


const Home = () => {

  return (
    <div className="px-30 bg-gray-50">
      <Header />
      <div className="flex gap-20">
        
        <div className="w-1/2 pt-15">
          <h1 className="text-6xl font-bold ">Your Kitchen,</h1>
          <h1 className="text-6xl font-bold text-green-500 pb-10">Organized</h1>
          <p className="text-lg font-medium opacity-50 pb-10">Never run out of ingredients again. Track your pantry, plan your <br /> meals, and reduce food waste with our smart kitchen inventory system.</p>
          <div className="bg-white rounded-xl shadow-xl grid grid-cols-3 px-8 py-8">
            <div className="text-center">
              <p className="text-green-400 text-3xl font-bold">40%</p>
              <p className="opacity-70 font-medium">Less Food Waste</p>
            </div>

            <div className="text-center">
              <p className="text-green-400 text-3xl font-bold">2.5x</p>
              <p className="opacity-70 font-medium">Better Planning</p>
            </div>

            <div className="text-center">
              <p className="text-green-400 text-3xl font-bold">15min</p>
              <p className="opacity-70 font-medium">Weekly Savings</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center py-10">
            <Link to="/signup" className="flex gap-2 items-center bg-green-500 hover:bg-green-600 py-2.5 px-6 rounded-lg font-bold text-white transition">
              Create a Kitchen <FaArrowRightLong />
            </Link>
            <Link to="/registertokitchen" className="flex gap-2 items-center bg-amber-50 hover:bg-amber-100 border border-amber-300 py-2.5 px-6 rounded-lg font-bold text-amber-800 transition">
              Join Existing Kitchen
            </Link>
          </div>

          <div className="flex gap-x-8">
            <div className="flex items-center gap-x-2">
              <div className="bg-green-100 text-green-500 text-lg p-1.5 rounded-[100%]">
              <FiCodesandbox />
            </div>
              <p className="opacity-80 ">Smart Tracking</p>
              </div>

              <div className="flex items-center gap-x-2">
              <div className="bg-orange-100 text-orange-500 text-lg p-1.5 rounded-[100%]">
              <FaRegClock />
            </div>
              <p className="opacity-80 text-orange-500">Expiry Alerts</p>
              </div>

              <div className="flex items-center gap-x-2">
              <div className="bg-green-100 text-green-500 text-lg p-1.5 rounded-[100%]">
              <MdOutlineFamilyRestroom />
            </div>
              <p className="opacity-80">Family Sharing</p>
              </div>
          </div>

        </div>



        <div className="w-1/2 relative rounded-xl shadow-2xl" style={{
          backgroundImage: `url(${kitchenhero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}>
          <div className="bg-white absolute right-5 top-5 p-3 rounded-lg flex gap-x-3">
            <div className="bg-green-500 text-2xl p-2 rounded-[100%] text-white">
              <FiCodesandbox />
            </div>
            <div className="space-y-[-8px]">
              <p className="font-semibold">142 Items</p>
              <span className="opacity-70">In your pantry</span>
            </div>
          </div>

          <div className="bg-white absolute left-5 bottom-5 p-3 rounded-lg flex gap-x-3">
            <div className="bg-green-500 text-2xl p-2 rounded-[100%] text-white">
             <FaRegClock />
            </div>
            <div className="space-y-[-8px]">
              <p className="font-semibold">3 Items Expiring</p>
              <span className="opacity-70">This Week</span>
            </div>
          </div>


        </div>

      </div>
    </div>

  )
}

export default Home