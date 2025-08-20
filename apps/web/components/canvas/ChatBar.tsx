import { Message } from "@/types";
import { current } from "@reduxjs/toolkit";
import { useEffect, useRef, useState } from "react";
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
    if ((chatDivRef.current && !isLoadingMore)) {
      const { scrollTop, scrollHeight, clientHeight } = chatDivRef.current;
    const isNearBottom =   
   

    }
  }, [messages, isLoadingMore]);
};
