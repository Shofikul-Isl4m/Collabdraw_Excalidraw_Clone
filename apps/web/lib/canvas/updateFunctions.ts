import { Draw } from "@/types";

type moveDrawType = (
  x: number,
  y: number,
  offsetX: number,
  offsetY: number,
  initialPointforFreeHand: {
    initialPoints: { x: number; y: number };
    originalPoints: { x: number; y: number }[];
  } | null,
  selectedDraw: Draw,
  diagrams: Draw[]
) => Draw | null;

export const moveDraw: moveDrawType = (
  x,
  y,
  offsetX,
  offsetY,
  initialPointforFreeHand,
  selectedDraw,
  diagrams
) => {
  const oldStartX = selectedDraw!.startX!;
  const oldStartY = selectedDraw?.startY;

  const newStartX = x - offsetX;
  const newStartY = y - offsetY;

  const dx = newStartX - oldStartX;
  const dy = newStartY - oldStartY!;

  selectedDraw!.startX = newStartX;
  selectedDraw!.startY = newStartY;
  selectedDraw!.endX! += dx;
  selectedDraw!.endY! += dy;

  if (
    (selectedDraw?.shape === "line" || selectedDraw!.shape === "arrow") &&
    selectedDraw?.points
  ) {
    selectedDraw.points = selectedDraw?.points.map((point) => ({
      x: point.x + dx,
      y: point.y + dy,
    }));
  }

  if (selectedDraw?.shape === "freeHand" && initialPointforFreeHand) {
    const dx = x - initialPointforFreeHand.initialPoints.x;
    const dy = x - initialPointforFreeHand.initialPoints.y;

    selectedDraw.points = initialPointforFreeHand.originalPoints.map(
      (point) => ({
        x: point.x + dx,
        y: point.y + dy,
      })
    );
  }

  const ind = diagrams.findIndex((draw) => draw.id === selectedDraw!.id);
  diagrams[ind] = selectedDraw;
  return selectedDraw;
};

type handleShapeSelectionBoxType = (
  draw: Draw,
  ctx: CanvasRenderingContext2D
) => Draw | null;
export const handleShapeSelectionBox: handleShapeSelectionBoxType = (
  draw,
  ctx
) => {
  let farthestLeft = Math.min(draw.startX!, draw.endX!);
  let farthestRight = Math.max(draw.startX!, draw.endX!);
  let farthestTop = Math.min(draw.startY!, draw.endY!);
  let farthestBottom = Math.max(draw.startY!, draw.endY!);

  switch (draw.shape) {
    case "rectangle":
    case "circle":
      return {
        ...draw,
        id: "0",
        shape: "rectangle",
        startX: farthestLeft - 5,
        startY: farthestTop - 5,
        endX: farthestRight + 5,
        endY: farthestBottom + 5,
        strokeStyle: "#5588ff",
        fillStyle: "transparent",
        lineWidth: 2,
      };

    case "diamond":
      return {
        ...draw,
        id: "0",
        shape: "rectangle",
        startX: farthestLeft - 5,
        startY: farthestTop - 5,
        endX: farthestRight + 5,
        endY: farthestBottom + 5,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
      };
    case "line":
    case "arrow":
      const p1 = { x: draw.startX!, y: draw.startY! };
      const p2 = { x: draw.points![0]!.x, y: draw.points![0]!.y };
      const p3 = { x: draw.endX!, y: draw.endY! };

      farthestLeft = Math.min(p1.x, p2.x, p3.x);
      farthestRight = Math.max(p1.x, p2.x, p3.x);
      farthestTop = Math.min(p1.y, p2.y, p3.y);
      farthestBottom = Math.max(p1.y, p2.y, p3.y);

      return {
        ...draw,
        id: "1",
        shape: "rectangle",
        startX: farthestLeft - 5,
        startY: farthestTop - 5,
        endX: farthestRight + 5,
        endY: farthestBottom + 5,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
        points: [p1, p2, p3],
      };
    case "freeHand":
      const points = draw.points!;
      farthestLeft = Math.min(...points.map((point) => point.x));
      farthestRight = Math.max(...points.map((point) => point.x));
      farthestTop = Math.min(...points.map((point) => point.y));
      farthestBottom = Math.max(...points.map((point) => point.y));
      return {
        ...draw,
        id: "1",
        shape: "rectangle",
        startX: farthestLeft - 5,
        startY: farthestTop - 5,
        endX: farthestRight + 5,
        endY: farthestBottom + 5,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
      };
    case "text":
      ctx.font = `${draw.fontSize}px ${draw.font}`;
      const endX = draw.startX! + ctx!.measureText(draw.text!).width;
      const endY = draw.startY! - parseInt(draw.fontSize!);
      return {
        ...draw,
        id: "1",
        shape: "rectangle",
        startX: draw.startX! - 10,
        startY: draw.startY! + 10,
        endX: endX + 10,
        endY: endY - 10,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
        text: "text",
      };
    default:
      return null;
  }
};
