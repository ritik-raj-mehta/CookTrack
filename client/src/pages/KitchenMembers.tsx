import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPeopleGroup } from "react-icons/fa6";
import { FiCalendar, FiCheck, FiCopy, FiMail, FiShield, FiUser } from "react-icons/fi";
import type { AppDispatch, RootState } from "../stores/store";
import { fetchKitchenMembers } from "../stores/slices/KitchenSlice";

const KitchenMembers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error, kitchenData } = useSelector(
    (state: RootState) => state.kitchen
  );
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

  const getAvatarGradient = (name: string) => {
    const charCode = (name || "U").charCodeAt(0);
    if (charCode % 3 === 0) return "from-emerald-500 to-green-600 text-white";
    if (charCode % 3 === 1) return "from-amber-500 to-orange-600 text-white";
    return "from-blue-500 to-indigo-600 text-white";
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white py-4 border-b border-gray-100 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3.5 items-center">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-400 text-2xl p-2.5 rounded-2xl text-white shadow-xs">
            <FaPeopleGroup />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
              Kitchen Members
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              People who have access to {kitchenData?.kitchenName || "this kitchen"}
            </p>
          </div>
        </div>

        {kitchenId && (
          <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/90 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <span className="text-xs font-semibold text-amber-900">Invite Code:</span>
            <span className="font-mono font-bold text-amber-800 text-sm tracking-wider">
              {kitchenId}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition font-medium cursor-pointer shadow-xs"
              title="Copy code for others to join"
            >
              {copied ? <FiCheck className="text-sm" /> : <FiCopy className="text-sm" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}
      </div>

      <div className="px-8 py-8 max-w-5xl animate-fadeIn space-y-6">
        {/* Invite Banner Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/70 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Invite Family & Roommates
            </h3>
            <p className="text-xs sm:text-sm text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
              Share your kitchen invite code <strong className="font-mono bg-white/70 px-2 py-0.5 rounded border border-amber-200 text-amber-950">{kitchenId}</strong>.
              Others can join by choosing "Join Existing Kitchen" during signup.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="self-start md:self-auto bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs hover-lift shrink-0"
          >
            {copied ? <FiCheck /> : <FiCopy />}
            <span>{copied ? "Code Copied!" : "Copy Invite Code"}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Members List Container */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Members List</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Active participants with inventory permissions ({members.length})
              </p>
            </div>
            {loading && (
              <span className="text-xs font-semibold text-emerald-600 animate-pulse">
                Refreshing members...
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {members.length === 0 && !loading ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <FiUser className="text-3xl text-gray-300 mx-auto" />
                <p className="text-sm font-medium">No members found for this kitchen.</p>
                <p className="text-xs text-gray-400">Share your invite code to get started.</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition duration-150"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                        member.userName
                      )} font-bold flex items-center justify-center text-base shadow-xs shrink-0`}
                    >
                      {member.userName ? member.userName[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">
                        {member.userName}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <FiMail className="text-gray-400 text-xs" />
                        <span>{member.userEmail}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 sm:gap-6 self-end sm:self-auto text-xs">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <FiCalendar className="text-gray-400" />
                      <span>Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 shadow-2xs ${
                        member.role === "KitchenAdmin"
                          ? "bg-amber-100 text-amber-800 border border-amber-200/80"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200/80"
                      }`}
                    >
                      <FiShield className="text-xs" />
                      <span>{member.role === "KitchenAdmin" ? "Admin" : member.role || "Member"}</span>
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