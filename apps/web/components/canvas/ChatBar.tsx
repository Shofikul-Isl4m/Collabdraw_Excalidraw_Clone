import { Message } from "@/types";
import { current } from "@reduxjs/toolkit";
import { Button } from "@repo/ui/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { TbFlagSearch } from "react-icons/tb";

interface ChatBarProps {
  closeChat: () => void;
  messages: Message[];
  user: { id: string; username: string };
  onSendMessage: (content: string) => void;
  onLoadMoreMessages: () => Promise<Message[]>;
  isLoadingMore: boolean;
  chatMessageInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

const ChatBar = ({
  closeChat,
  messages,
  user,
  onSendMessage,
  onLoadMoreMessages,
  isLoadingMore,
  chatMessageInputRef,
}: ChatBarProps) => {
  const chatDivRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState<"up" | "down" | null>(null);
  const [showBadge, setShowBadge] = useState<boolean>(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      if (
        chatDivRef.current?.scrollHeight &&
        chatDivRef.current?.clientHeight &&
        chatDivRef.current.scrollHeight > chatDivRef.current.clientHeight
      ) {
        const { scrollHeight, scrollTop, clientHeight } = chatDivRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (isAtBottom) {
          setShowArrow("up");
        } else {
          setShowArrow("down");
        }
      } else {
        setShowArrow(null);
      }
    };
    const handleScroll = async () => {
      if (chatDivRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatDivRef.current;

        const isAtTop = scrollTop === 0;

        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (isAtTop && !isLoadingMore) {
          const previousScrollHeight = scrollHeight;
          const newMessages = await onLoadMoreMessages();
          if (newMessages.length > 0) {
            setTimeout(() => {
              if (chatDivRef.current) {
                const newScrollHeight = chatDivRef.current.scrollHeight;
                chatDivRef.current.scrollTop =
                  newScrollHeight - previousScrollHeight;
              }
            }, 0);
          }
          return;
        }

        if (isAtBottom) {
          setShowArrow("up");
          setShowBadge(false);
        } else {
          setShowArrow("down");
        }

        checkScrollPosition();
      }
    };

    chatDivRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      chatDivRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [isLoadingMore, onLoadMoreMessages, messages]);

  useEffect(() => {
    if (chatDivRef.current && !isLoadingMore) {
      const { scrollTop, scrollHeight, clientHeight } = chatDivRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      if (isNearBottom || !isLoadingMore) {
        chatDivRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      } else {
        setShowBadge(true);
      }
    }
  }, [messages, isLoadingMore]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey && e.key == "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (
      chatMessageInputRef.current &&
      chatMessageInputRef.current.value.trim()
    ) {
      onSendMessage(chatMessageInputRef.current.value);
      chatMessageInputRef.current.value = "";
    }
  };
  const scrollToBottom = () => {
    chatDivRef.current?.scrollTo({
      top: chatDivRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollToTop = () => {
    chatDivRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed top-3 right-3 bottom-3 w-80 bg-neutral-900 border z-3 border-neutral-600 rounded-lg flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-neutral-600">
        <h3 className="text-white font-semibold">Chat</h3>
        <button className="text-neutral-400 hover:text-white transition-colors cursor-pointer ">
          <RxCross1 className="w-4 h-4" onClick={closeChat} />
        </button>
      </div>

      <div className="flex-1 relative min-h-0">
        <div
          ref={chatDivRef}
          className="h-full overflow-y-auto p-3 space-y-2  [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {isLoadingMore && (
            <div className="flex justify-center items-center gap-2 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <p className="text-white/60 text-sm">Loading more messages...</p>
            </div>
          )}

          <div className="space-y-2">
            {messages.map((message, index) => {
              const time = new Date(message.createdAt);
              const isOwnMessage = true;
              return (
                <div
                  key={message.id || index}
                  className={`${isOwnMessage ? "ml-auto bg-black-600/15 rounded-tr-none" : " mr-auto bg-neutral-800/50 rounded-tl-none"} max-w-[85%] rounded-xl px-3 py-2`}
                >
                  <div className="flex justify-between text-center mb-1">
                    <h4 className="text-white/60 font font-medium">
                      {" "}
                      {message.user.username}
                    </h4>
                    <p className="text-white/40 text-xs ">
                      {time.toLocaleDateString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                  <p className="text-white text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {showArrow === "down" && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 right-2 bg-neutral-800 hover:bg-neutral-700 rounded-full p-2 shadow-lg transition-colors"
          >
            <FaChevronDown className="text-neutral-400" size={12} />
          </button>
        )}
        {showArrow === "up" && (
          <button
            onClick={scrollToTop}
            className="absolute bottom-2 right-2 bg-neutral-800 hover:bg-neutral-700 rounded-full p-2 shadow-lg transition-colors"
          >
            <FaChevronUp className="text-neutral-400" size={12} />
          </button>
        )}
      </div>
      <div className="border-t p-3 border-neutral-600">
        <div className="flex items-end gap-2">
          <textarea
            ref={chatMessageInputRef}
            placeholder="Type your message..."
            className="flex-1 bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm resize-none max-h-20 min-h-[2.5rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-thumb]:rounded-full"
            onKeyDown={(e) => {
              e.stopPropagation();
              handleKeyDown(e);
            }}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 80)}px`;
            }}
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <IoSend className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Press <span className="bg-neutral-700 px-1 rounded">⌘</span> +{" "}
          <span className="bg-neutral-700 px-1 rounded">Enter</span> to send
        </p>
      </div>
    </div>
  );
};

export default ChatBar;
