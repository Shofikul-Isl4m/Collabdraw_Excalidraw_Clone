"use client";

import { useWebSocket } from "@/lib/hooks/websocket";
import { Action, Draw, Message } from "@/types";
import { Button } from "@repo/ui/components/ui/button";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";

import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import {
  PiArrowRight,
  PiChatCircle,
  PiCircle,
  PiCircleFill,
  PiCursor,
  PiCursorFill,
  PiDiamond,
  PiDiamondFill,
  PiEraser,
  PiEraserFill,
  PiLineVertical,
  PiLineVerticalLight,
  PiPencil,
  PiPencilFill,
  PiSquare,
  PiSquareFill,
} from "react-icons/pi";
import ChatBar from "./ChatBar";
import { useAppSelector } from "@/lib/hooks/redux";
import {
  performAction,
  pushToUndoRedoArrayRef,
} from "@/lib/canvas/actionRelatedFunctions";
import { fetchAllChatMessages } from "@/actions/chatAction";
import { LiaHandPaper, LiaHandRock } from "react-icons/lia";
import { BsFonts } from "react-icons/bs";
import { TbZoom } from "react-icons/tb";
import { current } from "@reduxjs/toolkit";
import { renderDraws } from "@/lib/canvas/drawFunctions";
import { Lectern } from "lucide-react";

const Canvas = ({ roomId, token }: { roomId: string; token: string }) => {
  const unreadMessagesRef = useRef<boolean>(false);
  const [showChatBar, setShowChatBar] = useState(true);
  const [chatMessage, setChatMessage] = useState<Message[]>([]);
  const chatMessageInputRef = useRef<HTMLTextAreaElement>(null);
  const [serverReady, setServerReady] = useState(false);
  const activeDraw = useRef<Draw>(null);
  const textInp = useRef<string>("");
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] =
    useState<boolean>(false);
  const lastSrNoRef = useRef<number>(0);
  const diagrams = useRef<Draw[]>([]);
  const user = useAppSelector((state) => state.app.user);
  const panOffset = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const scale = useRef<number>(1);
  const [activeAction, setActiveAction] = useState<
    "select" | "draw" | "move" | "erase" | "resize" | "pan" | "zoom" | "edit"
  >("select");
  const [activeShape, setActiveShape] = useState<
    "rectangle" | "diamond" | "circle" | "line" | "arrow" | "text" | "freeHand"
  >("rectangle");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedShape, setSelectedShape] =
    useState<Draw["shape"]>("rectangle");
  const [isClient, setIsClient] = useState<boolean>(false);
  const [activeStrokeStyle, setActiveStrokeStyle] = useState("#eeeeee");
  const [activeFillStyle, setActiveFillStyle] = useState("#eeeeee00");
  const [activeLineWidth, setActiveLineWidth] = useState(0);
  const [activeFont, setActiveFont] = useState<string>("Arial");
  const [activeFontSize, setActiveFontSize] = useState<string>("20");
  const { isError, isLoading, socket } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}?token${token}`
  );
  const selectedDraw = useRef<Draw>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeShapeRef = useRef(activeShape);
  const selectedShapeRef = useRef(selectedShape);
  const activeActionRef = useRef(activeAction);
  const isDraggingRef = useRef<boolean>(isDragging);
  const activeStrokeStyleRef = useRef<string>(activeStrokeStyle);
  const activeFillStyleRef = useRef(activeFillStyle);
  const activeLineWidthRef = useRef(activeLineWidth);
  const activeFontSizeRef = useRef(activeFontSize);
  const activeFontRef = useRef(activeFont);
  const currentX = useRef<number>(null);
  const currentY = useRef<number>(null);
  const originalDrawState = useRef<Draw>(null);
  const modifiedDrawState = useRef<Draw>(null);
  const undoRedoArrayRef = useRef<Action[]>([]);
  const undoRedoIndexRef = useRef<number>(-1);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [canundo, setCanUndo] = useState<boolean>(false);
  const panStartPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    activeShapeRef.current = activeShape;
    activeActionRef.current = activeAction;
    selectedShapeRef.current = selectedShape;
    isDraggingRef.current = isDragging;
    activeStrokeStyleRef.current = activeStrokeStyle;
    activeFillStyleRef.current = activeFillStyle;
    activeLineWidthRef.current = activeLineWidth;
    activeFontRef.current = activeFont;
    activeFontSizeRef.current = activeFontSize;

    if (canvasRef.current) {
      canvasRef.current.focus();
      switch (activeActionRef.current) {
        case "pan":
          if (isDraggingRef.current) {
            canvasRef.current.style.cursor = "grabbing";
          } else {
            canvasRef.current.style.cursor = "grab";
          }
          break;
        case "select":
          canvasRef.current.style = "default";
          break;
        case "move":
          canvasRef.current.style = "move";
          break;
        case "resize":
          canvasRef.current.style = "default";
          break;
        case "edit":
          canvasRef.current.style = "text";
          break;
        case "erase":
          canvasRef.current.style = "cell";
          break;
        case "draw":
          canvasRef.current.style = "crosshair";
          break;
        case "zoom":
          canvasRef.current.style = "zoom-in";
          break;
      }

      if (selectedDraw.current) {
        selectedDraw.current.strokeStyle = activeStrokeStyleRef.current;
        selectedDraw.current.fillStyle = activeFillStyleRef.current;
        selectedDraw.current.linewidth = activeLineWidthRef.current;
        selectedDraw.current.font = activeFontRef.current;
        if (
          selectedDraw.current.fontSize === "20" ||
          selectedDraw.current.fontSize === "40" ||
          selectedDraw.current.fontSize === "60"
        ) {
          selectedDraw.current.fontSize = activeFontSizeRef.current;
        }
      }
    }
  }, [
    activeShape,
    activeAction,
    selectedShape,
    isDragging,
    activeStrokeStyle,
    activeFillStyle,
    activeLineWidth,
    activeFont,
    activeFontSize,
  ]);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const changeActiveStrokeStyle = (color: string) => {
    setActiveStrokeStyle(color);
  };
  const changeActiveFillStyle = (color: string) => {
    setActiveFillStyle(color);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvasCurrent = canvasRef.current;
    const ctx = canvasCurrent.getContext("2d");
    if (!ctx) return;

    canvasCurrent.focus();

    setInterval(() => {
      renderDraws(
        ctx!,
        diagrams.current,
        activeDraw.current!,
        canvasCurrent,
        panOffset.current,
        scale.current
      );
    }, 15);

    const getMousePosition = (event: MouseEvent) => {
      return {
        offsetX: (event.offsetX - panOffset.current.x) / scale.current,
        offsetY: (event.offsetY - panOffset.current.y) / scale.current,
      };
    };

    const handleMouseDown = (event: MouseEvent) => {
      setIsDragging(true);
      if (activeActionRef.current === "pan") {
        panStartPoint.current = { x: event.offsetX, y: event.offsetY };
        return;
      }
      const { offsetX, offsetY } = getMousePosition(event);

      if (activeActionRef.current === "select") {
        const draw = getDrawAtPosition(offsetX, offsetY, diagrams.current, ctx);
      }

      if (activeActionRef.current === "draw") {
        if (activeDraw.current && activeDraw.current.shape === "text") {
          diagrams.current.push(activeDraw.current);
        }

        const currentActiveShape = activeShapeRef.current;
        const isDrawing = currentActiveShape === "freeHand";
        const isText = currentActiveShape === "text";
        const isLineOrArrow =
          currentActiveShape === "line" || currentActiveShape === "arrow";
        if (activeActionRef.current === "draw")
          activeDraw.current = {
            id: Date.now().toString() + "-" + user?.id,
            shape: activeShapeRef.current,
            strokeStyle: activeStrokeStyleRef.current,
            fillStyle: isText
              ? activeStrokeStyleRef.current
              : isDrawing
                ? "transparent"
                : activeFillStyleRef.current,
            linewidth: activeLineWidthRef.current,
            points:
              isDrawing || isLineOrArrow ? [{ x: offsetX, y: offsetY }] : [],
            startX: isDrawing ? undefined : offsetX,
            startY: isDrawing ? undefined : offsetY,
            text: isText ? textInp.current : "",
            font: activeFontRef.current,
            fontSize: activeFontSizeRef.current,
          };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const canvasCurrent = canvasRef.current!;
      if (activeActionRef.current === "pan") {
        if (isDraggingRef.current) {
          canvasCurrent.style.cursor = "grabbing";
          const dx = event.offsetX - panStartPoint.current.x;
          const dy = event.offsetY - panStartPoint.current.y;
          panOffset.current.x += dx;
          panOffset.current.y += dy;
          panStartPoint.current.x = event.offsetX;
          panStartPoint.current.y = event.offsetY;
        } else {
          canvasCurrent.style.cursor = "grab";
        }
      }

      const { offsetX, offsetY } = getMousePosition(event);

      if (activeActionRef.current === "draw") {
        if (!activeDraw.current) return;
        currentX.current = offsetX;
        currentY.current = offsetY;
        if (!activeActionRef.current) return;
        if (activeShapeRef.current === "freeHand") {
          activeDraw.current.points.push({
            x: currentX.current,
            y: currentY.current,
          });
        } else if (activeShapeRef.current !== "text") {
          ((activeDraw.current!.endX = currentX.current),
            (activeDraw.current!.endY = currentY.current));

          if (
            activeShapeRef.current === "line" ||
            activeShapeRef.current === "arrow"
          ) {
            activeDraw.current.points = [
              {
                x: (activeDraw.current.startX! + activeDraw.current.endX!) / 2,
                y: (activeDraw.current.startY! + activeDraw.current.endY) / 2,
              },
            ];
          }
        } else {
        }
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      const canvasCurrent = canvasRef.current!;
      setIsDragging(false);

      if (activeActionRef.current === "pan") {
        canvasCurrent.style.cursor = "grab";
        return;
      }
      const { offsetX, offsetY } = getMousePosition(event);

      if (activeActionRef.current === "draw") {
        if (activeShapeRef.current === "text") return;

        if (activeShapeRef.current !== "freeHand") {
          activeDraw.current!.endX = offsetX;
          activeDraw.current!.endY = offsetY;

          if (
            activeShapeRef.current === "rectangle" ||
            activeShapeRef.current === "diamond" ||
            activeShapeRef.current === "circle"
          ) {
            if (activeDraw.current?.endX! < activeDraw.current?.startX!) {
              let a = activeDraw.current!.endX;

              activeDraw.current!.endX = activeDraw.current!.startX;
              activeDraw.current!.startX = a;
            }
            if (activeDraw.current?.endY! < activeDraw.current?.startY!) {
              let a = activeDraw.current!.endY;

              activeDraw.current!.endY = activeDraw.current!.startY;
              activeDraw.current!.startY = a;
            }
          } else if (
            activeShapeRef.current === "line" ||
            activeShapeRef.current === "arrow"
          ) {
            activeDraw.current!.points = [
              {
                x:
                  (activeDraw.current?.startX! + activeDraw.current?.endX!) / 2,
                y:
                  (activeDraw.current?.startY! + activeDraw.current?.endY!) / 2,
              },
            ];
          }
        }
        diagrams.current.push(activeDraw.current!);
        activeDraw.current = null;
      }
    };

    const updateUndoRedoState = () => {
      if (undoRedoIndexRef.current > 0) {
        setCanUndo(true);
      }
      if (undoRedoIndexRef.current < undoRedoArrayRef.current.length - 1)
        setCanRedo(true);
    };

    const handlekeyDown = (event: KeyboardEvent) => {
      if (activeActionRef.current === "select") {
        return;
      }
      if (activeActionRef.current === "draw") {
        if (!activeDraw.current || activeDraw.current.shape !== "text") {
          return;
        }
        event.preventDefault();
        if (event.key === "Enter") {
          diagrams.current.push(activeDraw.current);
          if (socket) {
            const action: Action = {
              type: "create",
              originalDraw: null,
              modifiedDraw: JSON.parse(JSON.stringify(activeDraw.current)),
            };

            const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArrayRef(
              action,
              undoRedoArrayRef.current,
              undoRedoIndexRef.current,
              socket,
              user?.id!,
              roomId
            );
            originalDrawState.current = null;
            modifiedDrawState.current = null;
            undoRedoArrayRef.current = undoRedoArray;
            undoRedoIndexRef.current = undoRedoIndex;
            updateUndoRedoState();
          }
          textInp.current = "";
          activeDraw.current = null;
        } else if (event.key === "Escape") {
          textInp.current = "";
          activeDraw.current = null;
        } else if (event.key === "Backspace") {
          textInp.current = textInp.current.slice(0, -1);
          activeDraw.current.text = textInp.current;
        } else if (event.key.length === 1) {
          textInp.current += event.key;
          activeDraw.current.text = textInp.current;
        }
      }
    };

    const handleScroll = (event: WheelEvent) => {
      event.preventDefault();
      const { offsetX, offsetY } = getMousePosition(event);

      if (activeActionRef.current === "zoom" || event.ctrlKey) {
        const zoomSensitivity = 0.01;
        const newScale = scale.current - event.deltaY * zoomSensitivity;
        zoomAtPoint(newScale, offsetX, offsetY);
      } else {
        panOffset.current.x -= event.deltaX;
        panOffset.current.y -= event.deltaY;
      }
    };

    canvasCurrent.addEventListener("mousedown", handleMouseDown);
    canvasCurrent.addEventListener("mousemove", handleMouseMove);
    canvasCurrent.addEventListener("mouseup", handleMouseUp);
    canvasCurrent.addEventListener("keydown", handlekeyDown);
    canvasCurrent.addEventListener("wheel", handleScroll);

    return () => {
      canvasCurrent.removeEventListener("mousedown", handleMouseDown);
      canvasCurrent.removeEventListener("mousemove", handleMouseMove);
      canvasCurrent.removeEventListener("mouseup", handleMouseUp);
      canvasCurrent.removeEventListener("wheel", handleScroll);
    };
  }, [socket]);
  useEffect(() => {
    console.log(isDragging);
  }, [isDragging]);

  const zoomAtPoint = (newScale: number, offsetX: number, offsetY: number) => {
    const canvasCurrent = canvasRef.current;
    if (!canvasCurrent) return;
    const measureScale = Math.max(0.3, Math.min(newScale, 10));

    const worldX = (offsetX - panOffset.current.x) / scale.current;
    const worldY = (offsetY - panOffset.current.y) / scale.current;

    panOffset.current.x = offsetX - worldX * measureScale;
    panOffset.current.y = offsetY - worldY * measureScale;

    scale.current = measureScale;
  };

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
                <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full" />
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

        <div className="fixed top-3 left-1/2 z-2 w-fit h-fit bg-black rounded-lg transform -translate-x-1/2">
          <div className="bg-purple-500/25 px-1.5 py-1 flex gap-1.5 items-center">
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "select" || activeAction === "move" || activeAction === "resize" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("select");
                if (activeDraw.current.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "select" ||
              activeAction === "move" ||
              activeAction === "resize" ? (
                <PiCursorFill className="text-white" size={18} />
              ) : (
                <PiCursor className="text-white" size={18} />
              )}
              <p className="absolute right-1 bottom-1 text-white text-[8px] font-mono">
                1
              </p>
            </Button>
            <Button
              size="icon"
              className={`p-2 bg-transparent relative ${activeAction === "draw" && activeShape === "rectangle" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("rectangle");
                if (activeDraw.current.shape === "text") {
                  activedraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "draw" && activeShape === "rectangle" ? (
                <PiSquareFill size={18} className="text-white" />
              ) : (
                <PiSquare size={18} className="text-white" />
              )}

              <p className="font-mono text-[8px]  absolute bottom-1 right-1 text-white  ">
                2
              </p>
            </Button>
            <Button
              size="icon"
              className={`p-2 bg-transparent relative ${activeAction === "draw" && activeShape === "diamond" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("diamond");
                if (activeDraw.current.shape === "text") {
                  activedraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "draw" && activeShape === "diamond" ? (
                <PiDiamondFill size={18} className="text-white" />
              ) : (
                <PiDiamond size={18} className="text-white" />
              )}

              <p className="font-mono text-[8px]  absolute bottom-1 right-1 text-white  ">
                3
              </p>
            </Button>
            <Button
              size="icon"
              className={`p-2 bg-transparent relative ${activeAction === "draw" && activeShape === "circle" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("circle");
                if (activeDraw.current.shape === "text") {
                  activedraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "draw" && activeShape === "circle" ? (
                <PiCircleFill size={18} className="text-white" />
              ) : (
                <PiCircle size={18} className="text-white" />
              )}

              <p className="font-mono text-[8px]  absolute bottom-1 right-1 text-white  ">
                4
              </p>
            </Button>
            <Button
              size="icon"
              className={`p-2 bg-transparent relative ${activeAction === "draw" && activeShape === "line" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("line");
                if (activeDraw.current.shape === "text") {
                  activedraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              <PiLineVertical size={18} className="text-white" />

              <p className="font-mono text-[8px]  absolute bottom-1 right-1 text-white  ">
                5
              </p>
            </Button>
            <Button
              size="icon"
              className={`p-2 bg-transparent relative ${activeAction === "draw" && activeShape === "arrow" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("arrow");
                if (activeDraw.current.shape === "text") {
                  activedraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              <PiArrowRight size={18} className="text-white" />

              <p className="font-mono text-[8px]  absolute bottom-1 right-1 text-white  ">
                6
              </p>
            </Button>
            <Button
              size="icon"
              className={`p-2 bg-transparent relative ${activeAction === "draw" && activeShape === "freeHand" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("freeHand");
                if (activeDraw.current.shape === "text") {
                  activedraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "draw" && activeShape === "freeHand" ? (
                <PiPencilFill size={18} className="text-white" />
              ) : (
                <PiPencil size={18} className="text-white" />
              )}

              <p className="font-mono text-[8px]  absolute bottom-1 right-1 text-white  ">
                7
              </p>
            </Button>
            <Button
              size="icon"
              className={`p-2 bg-transparent relative ${activeAction === "draw" && activeShape === "text" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("text");
                if (activeDraw.current.shape === "text") {
                  activedraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              <BsFonts size={18} className="text-white" />

              <p className="font-mono text-[8px]  absolute bottom-1 right-1 text-white  ">
                8
              </p>
            </Button>
            <Button
              size="icon"
              className={`p-2 bg-transparent relative ${activeAction === "erase" ? "bg-purple-600" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setActiveAction("erase");

                if (activeDraw.current.shape === "text") {
                  activedraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "erase" ? (
                <PiEraserFill size={18} className="text-white" />
              ) : (
                <PiEraser size={18} className="text-white" />
              )}

              <p className="font-mono text-[8px]  absolute bottom-1 right-1 text-white  ">
                9
              </p>
            </Button>

            <PiLineVerticalLight className="text-purple-600" size={18} />
            <Button
              size="icon"
              className={`bg-transparent -ml-1 relative p-2 ${activeAction === "pan" ? "bg-purple-600 hover:bg-purple-600" : "hover:bg-purple-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("pan");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "pan" && isDragging ? (
                <LiaHandRock className="text-white" />
              ) : (
                <LiaHandPaper className="text-white" />
              )}
            </Button>
            <Button
              size="icon"
              className={`bg-transparent -ml-0.5 relative p-2 ${activeAction === "zoom" ? "bg-purple-600 hover:bg-purple-600" : "hover:bg-purple-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("zoom");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              <TbZoom className="text-white" />
            </Button>
          </div>
        </div>

        {activeAction === "draw" ||
        (activeAction === "select" && selectedShape !== null) ? (
          activeShape === "text" || selectedShape === "text" ? (
            <div className="fixed top-1/2 left-3 w-fit h-fit bg-black transform -translate-x-1/2">
              <div className="space-y-2 rounded-md text-white">
                <div className="text-sm">
                  <h3>Color</h3>
                  <div className="flex items-center gap-2 ">
                    <Button
                      className="bg-[#eeeeee] hover:bg-[#eeeeee] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#eeeeee");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      className="bg-[#FFD586] hover:bg-[#FFD586] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#FFD586");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      className="bg-[#FF9898] hover:bg-[#FF9898] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#FF9898");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      className="bg-[#B9D4AA] hover:bg-[#B9D4AA] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#B9D4AA");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      className="bg-[#8DD8FF] hover:bg-[#8DD8FF] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#8DD8FF");
                      }}
                    >
                      ..
                    </Button>
                    <PiLineVerticalLight size={20} />
                    <Button
                      size="icon"
                      className=" relative cursor-pointer -mr-1 text-transparent"
                      style={{ backgroundColor: activeStrokeStyle }}
                    >
                      ..
                    </Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>Font</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      className={`relative cursor-pointer font-[Arial] text-white -mr-1 ${activeFont === "arial" ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-900"}`}
                      onClick={() => changeActiveFont("Arial")}
                    >
                      Abc
                    </Button>
                    <Button
                      className={`relative cursor-pointer font-[Verdana] text-white -mr-1 ${activeFont === "arial" ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-900"}`}
                      onClick={() => changeActiveFont("Verdana")}
                    >
                      Abc
                    </Button>
                    <Button
                      className={`relative cursor-pointer font-[ComicSansMS] text-white -mr-1 ${activeFont === "arial" ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-900"}`}
                      onClick={() => changeActiveFont("Arial")}
                    >
                      Abc
                    </Button>
                  </div>
                </div>

                <div className="text-sm">
                  <h3>Font Size</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeFontSize === "20" ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFontSize(20)}
                    >
                      S
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeFontSize === "40" ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFontSize(40)}
                    >
                      M
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeFontSize === "60" ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFontSize(60)}
                    >
                      L
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeShape === "freeHand" ||
            activeShape === "line" ||
            activeShape === "arrow" ||
            selectedShape === "freeHand" ||
            selectedShape === "line" ||
            selectedShape === "arrow" ? (
            <div className="fixed left-3 bg-black top-1/2 transform  -translate-x-1/2  ">
              {" "}
              <div className="space-y-2 items-center  rounded-md">
                {" "}
                <div className="text-sm">
                  <h3>Color</h3>
                  <div className="flex items-center gap-2 ">
                    <Button
                      className="bg-[#eeeeee] hover:bg-[#eeeeee] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#eeeeee");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      className="bg-[#FFD586] hover:bg-[#FFD586] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#FFD586");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      className="bg-[#FF9898] hover:bg-[#FF9898] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#FF9898");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      className="bg-[#B9D4AA] hover:bg-[#B9D4AA] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#B9D4AA");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      className="bg-[#8DD8FF] hover:bg-[#8DD8FF] relative cursor-pointer -mr-1 text-transparent"
                      size="sm"
                      onClick={() => {
                        changeActiveStrokeStyle("#8DD8FF");
                      }}
                    >
                      ..
                    </Button>
                    <PiLineVerticalLight size={20} />
                    <Button
                      size="icon"
                      className=" relative cursor-pointer -mr-1 text-transparent"
                      style={{ backgroundColor: activeStrokeStyle }}
                    >
                      ..
                    </Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>stroke Width</h3>
                  <div className="flex items-center gap-2 ">
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 2 ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(2);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M4.167 10h11.666"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 3 ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(3);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M5 10h10"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 4 ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(4);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M5 10h10"
                          stroke="currentColor"
                          strokeWidth="3.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>{" "}
            </div>
          ) : (
            <div className="fixed px-3 py-2 z-2 w-fit h-fit border border-neutral-600 left-3 top-1/2 transform -translate-y-1/2 bg-black rounded-md">
              <div className="space-y-2 items-center rounded-md">
                <div className="text-sm">
                  <h3>Stroke</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-[#eeeeee] py-2 hover:bg-[#eeeeee] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#eeeeee");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FFD586] hover:bg-[#FFD586] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#FFD586");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FF9898] hover:bg-[#FF9898] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#FF9898");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#B9D4AA] hover:bg-[#B9D4AA] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#B9D4AA");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#8DD8FF] hover:bg-[#8DD8FF] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#8DD8FF");
                      }}
                    >
                      ..
                    </Button>
                    <PiLineVerticalLight size="20" />
                    <Button
                      size="icon"
                      className="relative cursor-default -mr-1"
                      style={{ backgroundColor: activeStrokeStyle }}
                    ></Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>Background</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="relative cursor-pointer -mr-1 text-transparent hover:bg-transparent bg-transparent border border-gray-400/20"
                      onClick={() => {
                        changeActiveFillStyle("#eeeeee00");
                      }}
                    >
                      .
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FFD58660] hover:bg-[#FFD58660] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveFillStyle("#FFD58660");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FF989860] hover:bg-[#FF989860] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveFillStyle("#FF989860");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#B9D4AA60] hover:bg-[#B9D4AA60] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveFillStyle("#B9D4AA60");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#8DD8FF60] hover:bg-[#8DD8FF60] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveFillStyle("#8DD8FF60");
                      }}
                    >
                      ..
                    </Button>
                    <PiLineVerticalLight size="20" />
                    <Button
                      size="icon"
                      className="relative cursor-default -mr-1 border"
                      style={{ backgroundColor: activeFillStyle }}
                    ></Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>Stroke Width</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 3 ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(3);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M4.167 10h11.666"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 6 ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(6);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M5 10h10"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 9 ? "bg-purple-600/40 hover:bg-purple-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(9);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M5 10h10"
                          stroke="currentColor"
                          strokeWidth="3.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <></>
        )}

        {isClient ? (
          <canvas
            className="bg-black absolute top-0 left-0"
            tabIndex={0}
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
          ></canvas>
        ) : (
          <canvas className="bg-black" tabIndex={0} ref={canvasRef}>
            {" "}
          </canvas>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Canvas;
