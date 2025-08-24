"use client";

import { useWebSocket } from "@/lib/hooks/websocket";
import { Draw, Message } from "@/types";
import { Button } from "@repo/ui/components/ui/button";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";

import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { PiChatCircle } from "react-icons/pi";
import ChatBar from "./ChatBar";
import { useAppSelector } from "@/lib/hooks/redux";
import { performAction } from "@/lib/canvas/actionRelatedFunctions";
import { fetchAllChatMessages } from "@/actions/chatAction";

const Canvas = ({ roomId, token }: { roomId: string; token: string }) => {
  const unreadMessagesRef = useRef<boolean>(false);
  const [showChatBar, setShowChatBar] = useState(true);
  const [chatMessage, setChatMessage] = useState<Message[]>([]);
  const chatMessageInputRef = useRef<HTMLTextAreaElement>(null);
  const [serverReady, setServerReady] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] =
    useState<boolean>(false);
  const lastSrNoRef = useRef<number>(0);
  const diagrams = useRef<Draw[]>([]);
  const user = useAppSelector((state) => state.app.user);
  const { isError, isLoading, socket } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}?token${token}`
  );

  useEffect(() => {
    if (socket && user && !isError && !isLoading) {
      if (serverReady) {
        const connectMessage = {
          type: "connect_room",
          roomId: roomId,
          userId: user.id,
        };
        socket.send(JSON.stringify(connectMessage));
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "connection_ready":
            setServerReady(true);
            break;
          case "error_message":
            alert("please try again");
            console.log(data.content, "try again");
            break;
          case "chat_messages":
            const message = JSON.parse(data.content);
            if (message.id !== user.id) {
              unreadMessagesRef.current = true;
            }
            setChatMessage((prev) => [...prev, message]);
            break;
          case "draw":
            if (data.userId === user.id) {
              return;
            }
            const action = JSON.parse(data.content);
            diagrams.current = performAction(action, diagrams.current);
        }
      };
    }

    return () => {
      if (user && socket && serverReady) {
        const disconnectMessage = {
          type: "disconnect_message",
          roomId,
          userId: user.id,
        };

        socket.send(JSON.stringify(disconnectMessage));
      }
    };
  }, [user, socket, isLoading, isError, roomId, serverReady]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await fetchAllChatMessages(roomId, undefined);
        setChatMessage(messages);
        if (messages.length > 0) {
          lastSrNoRef.current = messages[0]?.serialNumber!;
        }
      } catch (e) {
        console.error("failed to fetch messages", e);
      }
    };
    fetchMessages();
  }, [roomId]);

  const handleLoadMoreMessages = async (): Promise<Message[]> => {
    if (!lastSrNoRef.current || isLoadingMoreMessages) return [];

    setIsLoadingMoreMessages(true);

    try {
      const messages = await fetchAllChatMessages(roomId, lastSrNoRef.current);
      setChatMessage((prev) => [...messages, ...prev]);
      if (messages.length > 0) {
        lastSrNoRef.current = messages[0]?.serialNumber!;
      } else {
        lastSrNoRef.current = 0;
      }

      return messages;
    } catch (e) {
      return [];
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };

  const handleSendMessages = (content: string) => {
    if (!socket) {
      alert("connection failed please try again");
      return;
    }
    if (socket && serverReady && content.trim()) {
      const chatMessage = {
        type: "chat_message",
        userId: user?.id,
        roomId,
        content: content.trim(),
      };
      socket.send(JSON.stringify(chatMessage));
    }
  };

  return (
    <TooltipProvider>
      <div className="w-screen h-screen relative">
        <div className="fixed z-2 w-fit h-fit bg-neutral left-3 top-3 ">
          <div className="bg-purple-500 hover:bg-purple-400 px-1.5 py-1 rounded-lg flex gap-1.5 items-center">
            <Button
              size="icon"
              onClick={() => {
                redirect("");
              }}
              className={"p-2 hover:cursor-pointer "}
            >
              <AiOutlineHome size={18} className="text-white" />
            </Button>
          </div>
        </div>

        <div className="fixed z-2  right-3 top-3 rounded-lg bg-neutral-900  ">
          <div className="bg-purple-500 hover:bg-purple-400 items-center px-1.5 py-1 flex rounded-lg">
            <Button
              size="icon"
              className={`relative p-2 cursor-pinter ${showChatBar ? "bg-purple-600" : ""} ${unreadMessagesRef.current ? "bg-purple-950" : ""}`}
            >
              <PiChatCircle size={18} className="text-white" />
              {unreadMessagesRef.current && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </Button>
          </div>
        </div>
        {showChatBar && (
          <ChatBar
            closeChat={() => setShowChatBar(false)}
            messages={chatMessage}
            user={user!}
            onSendMessage={handleSendMessages}
            onLoadMoreMessages={handleLoadMoreMessages}
            isLoadingMore={isLoadingMoreMessages}
            chatMessageInputRef={chatMessageInputRef}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default Canvas;
