import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaPeopleGroup } from "react-icons/fa6";
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiCopy,
  FiLogOut,
  FiMail,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import type { AppDispatch, RootState } from "../stores/store";
import {
  deleteWholeKitchen,
  fetchKitchenMembers,
  leaveKitchen,
  makeMemberAdmin,
} from "../stores/slices/KitchenSlice";
import { clearKitchenSession } from "../stores/slices/AuthSlice";
import type { KitchenMember } from "../types/KitchenTypes";

const KitchenMembers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { members, loading, error, kitchenData } = useSelector(
    (state: RootState) => state.kitchen
  );
  const { kitchenId, role, userId } = useSelector((state: RootState) => state.auth);

  const [copied, setCopied] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal States
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const [showDeleteKitchenModal, setShowDeleteKitchenModal] = useState(false);
  const [isDeletingKitchen, setIsDeletingKitchen] = useState(false);

  const [memberToPromote, setMemberToPromote] = useState<KitchenMember | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  const isCurrentUserAdmin = role === "KitchenAdmin";

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

  // 1. Leave Kitchen
  const handleConfirmLeave = async () => {
    setIsLeaving(true);
    setActionError(null);
    try {
      await dispatch(leaveKitchen()).unwrap();
      dispatch(clearKitchenSession());
      setShowLeaveModal(false);
      navigate("/");
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Failed to leave kitchen.");
      setIsLeaving(false);
    }
  };

  // 2. Delete Entire Kitchen (Admin Only)
  const handleConfirmDeleteKitchen = async () => {
    setIsDeletingKitchen(true);
    setActionError(null);
    try {
      await dispatch(deleteWholeKitchen()).unwrap();
      dispatch(clearKitchenSession());
      setShowDeleteKitchenModal(false);
      navigate("/");
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Failed to delete kitchen.");
      setIsDeletingKitchen(false);
    }
  };

  // 3. Promote Member to Admin
  const handleConfirmPromote = async () => {
    if (!memberToPromote?._id) return;
    setIsPromoting(true);
    setActionError(null);
    try {
      const res = await dispatch(makeMemberAdmin(memberToPromote._id)).unwrap();
      setActionSuccess(res?.message || `${memberToPromote.userName} is now a Kitchen Admin.`);
      setMemberToPromote(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Failed to promote member.");
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen relative">
      {/* Top Header */}
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

        {/* Actions in Header */}
        <div className="flex items-center gap-3">
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

          {/* Exit Kitchen Button */}
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer hover-lift"
            title="Leave this kitchen"
          >
            <FiLogOut className="text-sm text-red-500" />
            <span>Exit Kitchen</span>
          </button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl animate-fadeIn space-y-6">
        {/* Alerts */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-xl flex items-center justify-between shadow-2xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <FiCheck className="text-base text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-700 font-bold ml-2 cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        )}

        {(actionError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl flex items-center justify-between shadow-2xs animate-fadeIn">
            <span>{actionError || error}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-red-700 font-bold ml-2 cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Invite Banner Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/70 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Invite Family & Roommates
            </h3>
            <p className="text-xs sm:text-sm text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
              Share your kitchen invite code{" "}
              <strong className="font-mono bg-white/70 px-2 py-0.5 rounded border border-amber-200 text-amber-950">
                {kitchenId}
              </strong>
              . Others can join by choosing "Join Existing Kitchen" during signup.
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
              members.map((member) => {
                const isMemberAdmin = member.role === "KitchenAdmin";
                const isCurrentUser = member._id === userId;

                return (
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm leading-tight">
                            {member.userName}
                          </h4>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <FiMail className="text-gray-400 text-xs" />
                          <span>{member.userEmail}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-5 self-end sm:self-auto text-xs">
                      <span className="text-gray-400 hidden sm:flex items-center gap-1.5">
                        <FiCalendar className="text-gray-400" />
                        <span>Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 shadow-2xs ${
                          isMemberAdmin
                            ? "bg-amber-100 text-amber-800 border border-amber-200/80"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200/80"
                        }`}
                      >
                        <FiShield className="text-xs" />
                        <span>{isMemberAdmin ? "Admin" : member.role || "Member"}</span>
                      </span>

                      {/* Make Admin Button (Only shown to KitchenAdmins for non-admin members) */}
                      {isCurrentUserAdmin && !isMemberAdmin && (
                        <button
                          type="button"
                          onClick={() => setMemberToPromote(member)}
                          className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer hover-lift shadow-2xs"
                          title={`Make ${member.userName} a Kitchen Admin`}
                        >
                          <FiShield className="text-xs text-amber-700" />
                          <span>Make Admin</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Danger Zone: Delete Kitchen (Kitchen Admin Only) */}
        {isCurrentUserAdmin && (
          <div className="bg-red-50/60 border border-red-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-red-950 flex items-center gap-2">
                  <FiAlertTriangle className="text-red-600 text-lg" />
                  Danger Zone: Delete Entire Kitchen
                </h3>
                <p className="text-xs sm:text-sm text-red-800/80 mt-1 max-w-xl leading-relaxed">
                  Permanently delete this kitchen, all inventory products, shopping lists, and disconnect
                  all members. This action is irreversible.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteKitchenModal(true)}
                className="self-start sm:self-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-xs transition hover-lift cursor-pointer flex items-center gap-2 shrink-0"
              >
                <FiTrash2 className="text-base" />
                <span>Delete Kitchen</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. EXIT / LEAVE KITCHEN CONFIRMATION MODAL                                */}
      {/* ========================================================================= */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">
              <FiLogOut />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Exit Kitchen?</h3>
              <p className="text-sm text-gray-600 px-2 leading-relaxed">
                Are you sure you want to exit{" "}
                <span className="font-semibold text-gray-900">
                  "{kitchenData?.kitchenName || "this kitchen"}"
                </span>
                ? You will be removed from members and lose access to its inventory.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={isLeaving}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <FiLogOut className="text-base" />
                {isLeaving ? "Leaving..." : "Yes, Exit Kitchen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DELETE ENTIRE KITCHEN CONFIRMATION MODAL (ADMIN ONLY)                  */}
      {/* ========================================================================= */}
      {showDeleteKitchenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">
              <FiAlertTriangle />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Permanently Delete Kitchen?</h3>
              <p className="text-sm text-gray-600 px-2 leading-relaxed">
                This will permanently delete{" "}
                <span className="font-semibold text-gray-900">
                  "{kitchenData?.kitchenName || "the kitchen"}"
                </span>
                , all pantry inventory items, shopping lists, and disconnect all members.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 leading-relaxed font-medium">
              Warning: This action cannot be undone. All stored kitchen data will be permanently wiped.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteKitchenModal(false)}
                disabled={isDeletingKitchen}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteKitchen}
                disabled={isDeletingKitchen}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <FiTrash2 className="text-base" />
                {isDeletingKitchen ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROMOTE MEMBER TO ADMIN CONFIRMATION MODAL                             */}
      {/* ========================================================================= */}
      {memberToPromote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">
              <FiShield />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Make Kitchen Admin?</h3>
              <p className="text-sm text-gray-600 px-2 leading-relaxed">
                Are you sure you want to promote{" "}
                <span className="font-semibold text-gray-900">"{memberToPromote.userName}"</span> to a
                Kitchen Admin?
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed font-medium">
              Kitchen Admins can add, edit, and delete products, invite members, promote other members,
              and manage the kitchen.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToPromote(null)}
                disabled={isPromoting}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPromote}
                disabled={isPromoting}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <FiShield className="text-base" />
                {isPromoting ? "Promoting..." : "Confirm Promotion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenMembers;