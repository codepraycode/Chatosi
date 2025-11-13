import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client"
import { SOCKET_BASE_URL } from "../config/env";


export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  isCheckingAuth: true,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket()
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data });
      toast.success("Account Created Successfully");
      get().connectSocket()
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket()
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Login Successful");
      get().connectSocket()
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/updateProfilePic", data)
      set({ authUser: res.data });
      toast.success("Profile Updated Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false })
    }
  },

  // useAuthStore.js - UPDATE connectSocket with LOUD LOGS
  connectSocket: () => {
    const { authUser, socket } = get()
    if (!authUser || socket?.connected) {
      return;
    }

    const socketIo = io(SOCKET_BASE_URL, {  // ← CHANGED: Use SOCKET_BASE_URL instead of BASE_URL!
      query: {
        userId: authUser._id
      },
      transports: ['websocket', 'polling']
    })


    socketIo.on("connect", () => {
    });

    socketIo.on("connect_error", () => {
    });

    socketIo.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    });

    set({ socket: socketIo })

  },

  disconnectSocket: () => {
    const currentSocket = get().socket
    if (currentSocket?.connected) {
      currentSocket.disconnect()
    }
    set({ socket: null })
  }

}));
