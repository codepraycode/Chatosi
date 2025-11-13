import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, X, Menu, Search, Circle } from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";

const avatar = "/avatar.png";
const Sidebar = () => {
  const {
    getUsers,
    getUnreadCount,
    selectedUser,
    users,
    setSelectedUser,
    isUserLoading,
  } = useChatStore();

  const { onlineUsers, authUser: currentUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Close mobile sidebar when a user is selected
  useEffect(() => {
    if (selectedUser && window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  }, [selectedUser]);

  // Filter users based on search and online status
  const filteredUsers = users.filter(user => {
    const isNotCurrentUser = user._id !== currentUser?._id;
    const matchesSearch = [user.fullName, user.username]
      .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));
    const isOnlineOrNotFiltered = !showOnlineOnly || onlineUsers.includes(user._id);

    return isNotCurrentUser && matchesSearch && isOnlineOrNotFiltered;
  }).sort((a, b) => {
    const aOnline = onlineUsers.includes(a._id) ? -1 : 1;
    const bOnline = onlineUsers.includes(b._id) ? -1 : 1;
    return aOnline - bOnline;
  });

  // Mobile sidebar toggle
  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  if (isUserLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-4 left-4 z-40 bg-base-100/90 backdrop-blur-lg rounded-full p-2 shadow-lg border border-base-300/20"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        h-full bg-base-100/95 backdrop-blur-lg border-r border-base-300/20 flex flex-col transition-all duration-300 ease-in-out
        fixed md:relative z-30
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-80 md:w-20 lg:w-80
      `}>

        {/* Header */}
        <div className="border-b border-base-300/20 p-4 space-y-2">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <Users className="size-6 text-primary" />
              <span className="font-semibold text-lg hidden md:hidden lg:block">Your Contacts</span>
              <span className="font-semibold text-lg md:hidden">Chats</span>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1 hover:bg-base-300 rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Search Bar - Hidden on mobile when collapsed */}
          <div className="hidden md:hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-base-200/50 rounded-lg border border-base-300/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-sm"
              />
            </div>
          </div>

          {/* Online Users Toggle */}
          <div className="mt-5 hidden md:hidden lg:flex items-center justify-between">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <span className="text-sm text-base-content/70">Online only</span>
            </label>
            <span className="text-xs text-base-content/40 bg-base-200 px-2 py-1 rounded-full">
              {onlineUsers.length - 1} online
            </span>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-base-content/40 p-8">
              <div className="w-16 h-16 mb-4 rounded-full bg-base-200 flex items-center justify-center">
                <Users className="size-6" />
              </div>
              <p className="text-center text-sm">
                {showOnlineOnly ? "No online users" : "No contacts found"}
              </p>
              {searchTerm && (
                <p className="text-xs mt-1">Try adjusting your search</p>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const unread = getUnreadCount(user._id);
              const isOnline = onlineUsers.includes(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <button
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`
                    w-full p-3 flex items-center gap-3 transition-all duration-200 group
                    hover:bg-base-300/50 active:bg-base-300
                    ${isSelected ? "bg-primary/10 border-r-2 border-primary" : ""}
                  `}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.profilePic || avatar}
                      alt={user.fullName}
                      className="size-12 object-cover rounded-full border-2 border-base-300 group-hover:border-primary/30 transition-colors"
                    />

                    {/* Online Status */}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full border-2 border-base-100" />
                    )}

                    {/* Unread Badge */}
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 border-2 border-base-100 font-medium">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>

                  {/* User Info - Hidden on medium screens, visible on large */}
                  <div className="hidden md:hidden lg:flex flex-col items-start min-w-0 flex-1">
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium truncate text-base-content">
                        {user.fullName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                      <div className={`flex items-center gap-1 ${isOnline ? 'text-success' : 'text-base-content/40'}`}>
                        <Circle className={`size-2 ${isOnline ? 'fill-current' : ''}`} />
                        <span className="text-xs">
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>

                      {/* Last message preview could go here */}
                      {user.lastMessage && (
                        <span className="text-xs text-base-content/50 truncate flex-1 text-right">
                          {user.lastMessage}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile-only user info */}
                  <div className="md:flex lg:hidden flex-col items-center text-center">
                    <span className="text-xs font-medium truncate max-w-[50px]">
                      {user.fullName?.split(' ')[0]}
                    </span>
                    {unread > 0 && (
                      <span className="text-[10px] text-red-500 font-bold">
                        {unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Current User Info - Bottom */}
        <div className="border-t border-primary p-4 hidden md:hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser?.profilePic || avatar}
                alt={currentUser?.fullName}
                className="size-10 object-cover rounded-full border-2 border-primary/30"
              />
              <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full border-2 border-base-100"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-base-content">
                {currentUser?.fullName}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;