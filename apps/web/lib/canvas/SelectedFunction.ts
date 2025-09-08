import { Draw } from "@/types";
type GetDrawAtPositionType = (
  x: number,
  y: number,
  diagram: Draw[],
  ctx: CanvasRenderingContext2D
) => Draw | null;

export const getDrawAtPosition: GetDrawAtPositionType = (
  x,
  y,
  diagram,
  ctx
) => {
  for (let i = diagram.length - 1; i >= 0; i--) {
    let draw = diagram[i];

    if (isWithinDraw(x, y, draw, ctx)) {
      return draw;
    }
  }
};

const isWithinDraw = (
  mouseX: number,
  mouseY: number,
  draw: Draw,
  ctx: CanvasRenderingContext2D
) => {
  if (!draw) return false;
  const shape = draw.shape;
  switch (shape) {
    case "rectangle":
      if (
        draw.startX === undefined ||
        draw.endX === undefined ||
        draw.startY === undefined ||
        draw.endY === undefined
      )
        return false;

      const minX = Math.min(draw.startX, draw.endX);
      const maxX = Math.max(draw.startX, draw.endX);
      const minY = Math.min(draw.startY, draw.endY);
      const maxY = Math.max(draw.startY, draw.endY);

      return (
        mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY
      );

    case "diamond":
      if (
        !draw.startX === undefined ||
        !draw.endX === undefined ||
        !draw.startY === undefined ||
        !draw.endY === undefined
      )
        return false;

      const width = draw.endX! - draw.startX!;
      const height = draw.endY! - draw.startY!;

      const absW = Math.abs(width);
      const absH = Math.abs(height);
      const centerX = draw.startX! + width / 2;
      const centerY = draw.startY! + height / 2;

      if (absW === 0 || absH === 0) {
        const p1 = { x: draw.startX, y: draw.startY };
        const p2 = { x: draw.endX, y: draw.endY };
        const lineTolarance = 5;

        const lenSq = Math.pow(p2.x! - p1.x!, 2) + Math.pow(p2.y! - p1.y!, 2);
        if (lenSq === 0) {
          return (
            Math.pow(mouseX - p1.x!, 2) + Math.pow(mouseY - p1.y!, 2) <
            lineTolarance * lineTolarance
          );
        }

        let t =
          ((mouseX - p1.x!) * (p2.x! - p1.x!) +
            (mouseY - p1.y!) * (p2.y! - p1.y!)) /
          lenSq;

        t = Math.max(0, Math.min(t, 1));

        const closestX = p1.x! + t * (p2.x! - p1.x!);
        const closestY = p1.y! + t * (p2.y! - p1.y!);

        const distSq =
          Math.pow(mouseX - closestX, 2) + Math.pow(mouseY - closestY, 2);

        return distSq < lineTolarance * lineTolarance;
      }

      const dx = Math.abs(mouseX - centerX);
      const dy = Math.abs(mouseY - centerY);

      const isInside = dx / (absW / 2) + dy / (absH / 2) <= 1;

      const vertecies = [
        { x: centerX, y: draw.startY },
        { x: draw.endX, y: centerY },
        { x: centerX, y: draw.endY },
        { x: draw.startX, y: centerY },
      ];
      let onCircumference = false;

      for (let i = 0; i < vertecies.length; i++) {
        const p1 = vertecies[i]!;
        const p2 = vertecies[(i + 1) % vertecies.length]!;
        const lenSq =
          Math.pow(p2!.x! - p1!.x!, 2) + Math.pow(p2!.y! - p1!.y!, 2);
        const lineTolarance = 5;

        if (lenSq === 0) continue;

        let t =
          ((mouseX - p1.x!) * (p2.x! - p1.x!) +
            (mouseY - p1.y!) * (p2.y! - p1.y!)) /
          lenSq;

        t = Math.max(0, Math.min(t, 1));

        const closestX = p1.x! + t * (p2.x! - p1.x!);
        const closestY = p1.y! + t * (p2.y! - p1.y!);

        const distSq =
          Math.pow(mouseX - closestX, 2) + Math.pow(mouseY - closestY, 2);

        if (distSq < lineTolarance * lineTolarance) {
          onCircumference = true;
          break;
        }
      }

      if (draw.fillStyle !== "transparent") {
        return isInside || onCircumference;
      } else {
        return onCircumference;
      }

    case "circle":
  }
};
