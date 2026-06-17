import { useState, useEffect } from "react";
import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { ref, get, set, remove, onValue } from "firebase/database";
import {
  Key,
  Mail,
  ShieldAlert,
  CheckCircle2,
  User as UserIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export function UserManagement() {
  const [user, setUser] = useState(auth.currentUser);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailStatus, setEmailStatus] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Profile change state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [profileStatus, setProfileStatus] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        const userRef = ref(db, `users/${u.uid}`);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setUsername(data.username || "");
            setOriginalUsername(data.username || "");
          }
        });
        return () => unsubscribeDb();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);

    if (newPassword !== retypePassword) {
      setPwdStatus({ message: "New passwords do not match.", type: "error" });
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPwdStatus({
        message:
          "Password must be at least 8 characters long and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol.",
        type: "error",
      });
      return;
    }

    if (!user || !user.email) return;

    setPwdLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPwdStatus({
        message: "Password updated successfully!",
        type: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setRetypePassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPwdStatus({ message: err.message, type: "error" });
      } else {
        setPwdStatus({
          message: "An unexpected error occurred",
          type: "error",
        });
      }
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus(null);

    if (!user || !user.email) return;

    setEmailLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        emailPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      await sendEmailVerification(user);
      setEmailStatus({
        message: "Email updated! Please verify your new email address.",
        type: "success",
      });
      setNewEmail("");
      setEmailPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEmailStatus({ message: err.message, type: "error" });
      } else {
        setEmailStatus({
          message: "An unexpected error occurred",
          type: "error",
        });
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user || !user.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPwdStatus({
        message: "Password reset link sent to your email.",
        type: "success",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPwdStatus({ message: err.message, type: "error" });
      } else {
        setPwdStatus({
          message: "An unexpected error occurred",
          type: "error",
        });
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);

    if (!user) return;

    if (!firstName || !lastName || !username) {
      setProfileStatus({ message: "All fields are required.", type: "error" });
      return;
    }

    const usernameRegex = /^[a-z0-9][a-z0-9._\-@]*$/;
    if (!usernameRegex.test(username)) {
      setProfileStatus({
        message:
          "Username must be lowercase, start with a letter/number, and contain only allowed symbols.",
        type: "error",
      });
      return;
    }

    setProfileLoading(true);
    try {
      // Check if username changed and is available
      if (username !== originalUsername) {
        const safeUsername = username.replace(/\./g, ',');
        const usernameRef = ref(db, `usernames/${safeUsername}`);
        const snapshot = await get(usernameRef);
        if (snapshot.exists()) {
          setProfileStatus({
            message: "Username is already taken. Please choose another one.",
            type: "error",
          });
          setProfileLoading(false);
          return;
        }
      }

      // Update users node
      await set(ref(db, `users/${user.uid}`), {
        firstName,
        lastName,
        username,
        email: user.email,
      });

      // Update usernames node if changed
      if (username !== originalUsername) {
        const safeUsername = username.replace(/\./g, ',');
        await set(ref(db, `usernames/${safeUsername}`), user.email);
        if (originalUsername) {
          // Free up the old username
          const safeOldUsername = originalUsername.replace(/\./g, ',');
          await remove(ref(db, `usernames/${safeOldUsername}`));
        }
        setOriginalUsername(username);
      }

      setProfileStatus({
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileStatus({ message: err.message, type: "error" });
      } else {
        setProfileStatus({
          message: "An unexpected error occurred",
          type: "error",
        });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteStatus(null);
    if (!user || !user.email) return;

    setDeleteLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user data from database
      await remove(ref(db, `users/${user.uid}`));
      if (originalUsername) {
        const safeUsername = originalUsername.replace(/\./g, ',');
        await remove(ref(db, `usernames/${safeUsername}`));
      }
      
      // Delete user authentication record
      await deleteUser(user);
      
      // User will automatically be signed out and redirected
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteStatus({ message: err.message, type: "error" });
      } else {
        setDeleteStatus({
          message: "An unexpected error occurred",
          type: "error",
        });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-blue-600 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-inner">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
            {user?.email || "Loading..."}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {user?.emailVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-500/20">
                <ShieldAlert className="w-3 h-3" /> Unverified
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">UID: {user?.uid}</span>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          Profile Information
        </h3>

        {profileStatus && (
          <div
            className={`mb-4 p-3 rounded border text-sm ${
              profileStatus.type === "error"
                ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500 text-red-600 dark:text-red-500"
                : "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500 text-green-600 dark:text-green-500"
            }`}
          >
            {profileStatus.message}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only lowercase letters, numbers, and ._-@
            </p>
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="w-full sm:w-auto mt-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium transition-colors disabled:opacity-50"
          >
            {profileLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Change Password
            </h3>
            <button
              onClick={handleSendResetEmail}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Send Reset Link
            </button>
          </div>

          {pwdStatus && (
            <div
              className={`mb-4 p-3 rounded border text-sm ${
                pwdStatus.type === "error"
                  ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500 text-red-600 dark:text-red-500"
                  : "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500 text-green-600 dark:text-green-500"
              }`}
            >
              {pwdStatus.message}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Retype New Password
              </label>
              <input
                type="password"
                required
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium transition-colors disabled:opacity-50"
            >
              {pwdLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Change Email */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            Change Email
          </h3>

          {emailStatus && (
            <div
              className={`mb-4 p-3 rounded border text-sm ${
                emailStatus.type === "error"
                  ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500 text-red-600 dark:text-red-500"
                  : "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500 text-green-600 dark:text-green-500"
              }`}
            >
              {emailStatus.message}
            </div>
          )}

          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Email Address
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password (to verify)
              </label>
              <input
                type="password"
                required
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium transition-colors disabled:opacity-50"
            >
              {emailLoading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </div>
      </div>
      {/* Delete Account */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-900/50 shadow-sm mt-8">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Delete Account
        </h3>
        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          Permanently delete your account and all of your data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action is irreversible.</p>
              </div>
            </div>
            
            {deleteStatus && (
              <div
                className={`mb-4 p-3 rounded border text-sm ${
                  deleteStatus.type === "error"
                    ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500 text-red-600 dark:text-red-500"
                    : "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500 text-green-600 dark:text-green-500"
                }`}
              >
                {deleteStatus.message}
              </div>
            )}

            <form onSubmit={handleDeleteAccount}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter Password to Confirm
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  placeholder="Your password"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
