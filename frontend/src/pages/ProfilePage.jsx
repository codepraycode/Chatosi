import { useState, useEffect } from "react";

import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Loader, X, Calendar, Shield, CheckCircle } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const avatar = "/avatar.png";
const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [hasChanges, setHasChanges] = useState(false);

  const { isProfileOpen: isOpen, openSettings } = useThemeStore();

  const onClose = () => {
    openSettings(false);
  }

  // ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
      // Reset form when opening
      setFullName(authUser?.fullName || "");
      setSelectedImage(null);
      setHasChanges(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, authUser?.fullName]);

  // Check for changes
  useEffect(() => {
    const nameChanged = fullName !== authUser?.fullName;
    const imageChanged = selectedImage !== null;
    setHasChanges(nameChanged || imageChanged);
  }, [fullName, selectedImage, authUser?.fullName]);

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleNameUpdate = async () => {
    if (!fullName.trim() || fullName === authUser?.fullName) return;
    await updateProfile({ fullName: fullName.trim() });
  };

  const handleSaveAll = async () => {
    const updates = {};

    if (fullName.trim() !== authUser?.fullName) {
      updates.fullName = fullName.trim();
    }

    if (selectedImage) {
      updates.profilePic = selectedImage;
    }

    if (Object.keys(updates).length > 0) {
      await updateProfile(updates);
      onClose();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-base-100 rounded-2xl shadow-2xl border border-base-300/30 w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300/30 bg-base-100/80 backdrop-blur-lg">
          <div>
            <h2 className="text-2xl font-bold text-base-content">Profile Settings</h2>
            <p className="text-base-content/70 mt-1">Manage your account information</p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-base-300 rounded-lg transition-colors group"
            aria-label="Close profile settings"
          >
            <X className="size-6 text-base-content/60 group-hover:text-base-content" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="relative">
                  <img
                    src={selectedImage || authUser?.profilePic || avatar}
                    alt="Profile"
                    className="size-32 rounded-full object-cover border-4 border-base-300 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                </div>

                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-2 right-2 bg-primary text-primary-content p-2 rounded-full cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 ${isUpdatingProfile ? "animate-pulse pointer-events-none opacity-70" : ""
                    }`}
                >
                  <Camera className="size-5" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-base-content">
                  {authUser?.fullName || "User"}
                </h3>
                <p className="text-sm text-base-content/60 flex items-center justify-center gap-1">
                  <CheckCircle className="size-4 text-success" />
                  Verified Account
                </p>
                {isUpdatingProfile && (
                  <p className="text-sm text-warning flex items-center justify-center gap-1">
                    <Loader className="size-4 animate-spin" />
                    Updating profile...
                  </p>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                  <User className="size-4" />
                  Full Name
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-base-200 border border-base-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    placeholder="Enter your full name"
                  />
                  <button
                    onClick={handleNameUpdate}
                    disabled={isUpdatingProfile || !fullName.trim() || fullName === authUser?.fullName}
                    className="px-6 py-3 bg-primary text-primary-content rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-w-[80px]"
                  >
                    {isUpdatingProfile ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-base-content">
                  <Mail className="size-4" />
                  Email Address
                </label>
                <div className="px-4 py-3 bg-base-200 border border-base-300/50 rounded-xl">
                  <p className="text-base-content/80">{authUser?.email || "Not provided"}</p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-base-200/30 rounded-xl p-5 border border-base-300/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                Account Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-base-content/70 flex items-center gap-2">
                    <Calendar className="size-4" />
                    Member Since
                  </span>
                  <span className="font-medium text-base-content">
                    {authUser?.createdAt ? formatDate(authUser.createdAt) : "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-base-content/70">Account Status</span>
                  <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="size-3" />
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-base-content/70">User ID</span>
                  <span className="text-xs font-mono text-base-content/50 bg-base-300 px-2 py-1 rounded">
                    {authUser?._id?.slice(-8) || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-base-300/30">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 border border-base-300/50 rounded-lg hover:bg-base-300/50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isUpdatingProfile || !hasChanges}
                className="px-6 py-2.5 bg-primary text-primary-content rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg flex items-center gap-2"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;