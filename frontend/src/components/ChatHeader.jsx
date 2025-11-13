import { X, MoreVertical, Phone, Video, Circle, Info } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

import { useEffect, useState } from "react";
import { useKeyboardShortcuts } from "../hooks/useShortcuts";
import toast from "react-hot-toast";

const avatar = "/avatar.png";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Check online status with debounce for smooth transitions
  useEffect(() => {
    const online = onlineUsers.includes(selectedUser._id);
    setIsOnline(online);
  }, [selectedUser._id, onlineUsers]);

  // ESC key to close chat
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedUser(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [setSelectedUser]);

  const handleCloseChat = () => {
    setSelectedUser(null);
  };


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) setShowMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const getStatusColor = () => {
    return isOnline ? 'text-success' : 'text-base-content/40';
  };

  const getStatusText = () => {
    return isOnline ? 'Online' : 'Offline';
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Format last seen time (you can enhance this with actual last seen data)
  const getLastSeen = () => {
    if (isOnline) return 'Active now';

    // This is a placeholder - you'd want to use actual last seen data from your backend
    return 'Last seen recently';
  };

  return (
    <div className="p-4 border-b border-base-300/30 bg-base-100/80 backdrop-blur-lg sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Back button for mobile */}
          <button
            onClick={handleCloseChat}
            className="md:hidden p-2 hover:bg-base-300 rounded-lg transition-colors mr-1"
            title="Back to contacts (ESC)"
          >
            <X className="size-5" />
          </button>

          {/* Avatar with online status */}
          <div className="relative flex-shrink-0">
            <div className="size-12 rounded-full border-2 border-base-300/50 overflow-hidden">
              <img
                src={selectedUser.profilePic || avatar}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Online status indicator */}
            <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-base-100 ${isOnline ? 'bg-success animate-pulse' : 'bg-base-content/30'
              }`} />
          </div>

          {/* User details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base-content truncate">
                {selectedUser.fullName}
              </h3>

              {/* Verification badge or other status could go here */}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1.5 text-sm ${getStatusColor()}`}>
                <Circle className="size-2 fill-current" />
                <span>{getStatusText()}</span>
              </div>

              {/* Last seen or typing indicator */}
              <span className="text-xs text-base-content/50">•</span>
              <span className="text-xs text-base-content/50 truncate">
                {getLastSeen()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Call buttons (optional features) */}
          <button
            className="p-2.5 hover:bg-base-300 rounded-lg transition-colors group"
            title="Voice call"
            onClick={() => toast.error('Voice call feature coming soon!')}
          >
            <Phone className="size-5 text-base-content/60 group-hover:text-base-content" />
          </button>

          <button
            className="p-2.5 hover:bg-base-300 rounded-lg transition-colors group"
            title="Video call"
            onClick={() => toast.error('Video call feature coming soon!')}
          >
            <Video className="size-5 text-base-content/60 group-hover:text-base-content" />
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className="p-2.5 hover:bg-base-300 rounded-lg transition-colors group"
              title="More options"
            >
              <MoreVertical className="size-5 text-base-content/60 group-hover:text-base-content" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-base-100 border border-base-300/30 rounded-lg shadow-lg py-2 min-w-[140px] z-30">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-base-300/50 transition-colors flex items-center gap-3 text-sm"
                  onClick={() => {
                    console.log('View profile clicked');
                    setShowMenu(false);
                  }}
                >
                  <Info className="size-4" />
                  View Profile
                </button>

                <button
                  className="w-full px-4 py-2 text-left hover:bg-base-300/50 transition-colors flex items-center gap-3 text-sm text-error"
                  onClick={() => {
                    console.log('Clear chat clicked');
                    setShowMenu(false);
                  }}
                >
                  <X className="size-4" />
                  Clear Chat
                </button>
              </div>
            )}
          </div>

          {/* Close button for desktop */}
          <button
            onClick={handleCloseChat}
            className="hidden md:flex p-2.5 hover:bg-error/20 hover:text-error rounded-lg transition-colors group ml-1"
            title="Close chat (ESC)"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;