"use client";

import { useWebSocket } from "@/lib/hooks/websocket";
import { Message } from "@/types";
import { Button } from "@repo/ui/components/ui/button";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { ChartBar } from "lucide-react";
import { redirect } from "next/navigation";
import { useRef, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { PiChatCircle } from "react-icons/pi";

const Canvas = ({ roomId, token }: { roomId: string; token: string }) => {
  const unreadMessagesRef = useRef<boolean>(false);
  const [showChatBar, setShowChatBar] = useState(false);
  const [chatMessage, setChatMessage] = useState<Message[]>([]);
  const { isError, isLoading, socket } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}?token${token}`
  );
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
            message={chatMessage}
            user={user}
            onSendMessage={handleSendMessages}
            onLoadMoreMessages={handleLoadMoreMessages}
            isLoadingMore={isLoadMoreMessages}
            chatMessageInputRef={chatMessageInputRef}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default Canvas;
