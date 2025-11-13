import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { CSSPattern } from "./ui/patterns/PatternBackground";

const avatar = "/avatar.png";

const ChatContainer = () => {
  const {
    isMessagesLoading,
    messages,
    getMessages,
    selectedUser,
    subscribeToMasterListener,
    unSubscribeFromMasterListener,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Fetch + subscribe only when a user is selected
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMasterListener();

    return () => unSubscribeFromMasterListener();
  }, [selectedUser?._id, getMessages, subscribeToMasterListener, unSubscribeFromMasterListener]);

  // Auto-scroll when new messages come
  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0 && isAtBottom) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // Handle scroll position
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom < 100);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col bg-base-100 relative">
        <CSSPattern type="dots" intensity="light" />
        <ChatHeader />
        <div className="flex-1 overflow-hidden">
          <MessageSkeleton />
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-100 text-base-content/60">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-base-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <CSSPattern type="dots" intensity="light" />

      <ChatHeader />

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/40">
            <div className="w-20 h-20 mb-4 rounded-full bg-base-200 flex items-center justify-center">
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-lg font-medium">Start a conversation!</p>
            <p className="text-sm">Send your first message to {selectedUser.username}</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              authUser={authUser}
              selectedUser={selectedUser}
              avatar={avatar}
            />
          ))
        )}
        <div ref={messageEndRef} className="h-4" />
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && messages.length > 3 && (
        <button
          onClick={() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-primary text-primary-content rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      <MessageInput />
    </div>
  );
};

// Separate message bubble component for better organization
const MessageBubble = ({ message, authUser, selectedUser, avatar }) => {
  const isOwnMessage = message.senderId === authUser._id;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-end space-x-2 max-w-[85%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar - hidden for own messages on larger screens */}
        <div>
          <div className="size-8 rounded-full border-2 border-base-300 overflow-hidden">
            <img
              src={isOwnMessage ? authUser.profilePic || avatar : selectedUser.profilePic || avatar}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Sender name for group chats (optional) */}
          {!isOwnMessage && (
            <span className="text-xs text-base-content/50 mb-1 ml-1">{selectedUser.username}</span>
          )}

          <div className={`chat-bubble flex flex-col break-words ${isOwnMessage
            ? 'bg-primary text-primary-content rounded-br-md'
            : 'bg-base-200 text-base-content rounded-bl-md'
            } rounded-2xl px-4 py-2 shadow-sm`}>
            {message.image && (
              <img
                src={message.image}
                alt="attachment"
                className="max-w-[200px] rounded-lg mb-2 border border-base-300"
              />
            )}
            {message.text && (
              <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
            )}
          </div>

          {/* Timestamp */}
          <time className="text-xs opacity-50 mt-1 px-1">
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;