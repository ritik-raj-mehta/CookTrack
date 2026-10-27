import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";
import { fetchKitchenMembers } from "../stores/slices/KitchenSlice";
import { FaPeopleGroup } from "react-icons/fa6";
import { FiCopy, FiCheck, FiMail, FiCalendar, FiShield } from "react-icons/fi";

const KitchenMembers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error, kitchenData } = useSelector((state: RootState) => state.kitchen);
  const { kitchenId } = useSelector((state: RootState) => state.auth);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (kitchenId) {
      dispatch(fetchKitchenMembers());
    }
  }, [dispatch, kitchenId]);

  const handleCopyCode = () => {
    if (kitchenId) {
      navigator.clipboard.writeText(kitchenId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <div className="bg-white py-3 border-b border-black/10 px-8 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="bg-amber-100 text-2xl p-2 rounded-full text-amber-800">
            <FaPeopleGroup />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-amber-950">
              Kitchen Members
            </h1>
            <p className="text-sm font-medium opacity-85">
              People who have access to {kitchenData?.kitchenName || "this kitchen"}
            </p>
          </div>
        </div>

        {kitchenId && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-semibold text-amber-900">Invite Code:</span>
            <span className="font-mono font-bold text-amber-800 text-sm">{kitchenId}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded cursor-pointer transition"
              title="Copy code for others to join"
            >
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      <div className="px-8 py-8 max-w-5xl">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-amber-950">Invite New Members</h3>
            <p className="text-sm text-amber-900/80 mt-0.5">
              Share your kitchen invite code <strong className="font-mono">{kitchenId}</strong> with family or roommates. They can join by selecting "Join Existing Kitchen" on the registration page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition"
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? "Code Copied!" : "Copy Invite Code"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">
              Members List ({members.length})
            </h2>
            {loading && <span className="text-sm text-blue-500">Loading members...</span>}
          </div>

          <div className="divide-y divide-gray-100">
            {members.length === 0 && !loading ? (
              <div className="p-8 text-center text-gray-500">
                No members found for this kitchen.
              </div>
            ) : (
              members.map((member) => (
                <div key={member._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-lg">
                      {member.userName ? member.userName[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-base">{member.userName}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiMail className="text-gray-400" />
                        {member.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiCalendar />
                      Joined {new Date(member.createdAt).toLocaleDateString()}
                    </span>

                    <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                      member.role === "KitchenAdmin"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      <FiShield />
                      {member.role || "Member"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenMembers;