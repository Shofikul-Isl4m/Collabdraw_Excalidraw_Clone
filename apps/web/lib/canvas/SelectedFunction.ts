import { Draw } from "@/types";
import { line } from "framer-motion/client";
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

    if (isWithinDraw(x, y, draw!, ctx)) {
      return draw!;
    }
  }
  return null;
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

    case "circle": {
      if (
        draw.startX === undefined ||
        draw.startY === undefined ||
        draw.endX === undefined ||
        draw.endY === undefined
      )
        return false;

      const centerX = (draw.startX! + draw.endX!) / 2;
      const centerY = (draw.startY! + draw.endY!) / 2;

      const radiusX = Math.abs(draw.endX - draw.startX) / 2;
      const radiusY = Math.abs(draw.endY - draw.startY) / 2;

      if (radiusX === 0 || radiusY === 0) {
        let p1, p2;

        if (radiusX === 0 && radiusY === 0) {
          p1 = { x: centerX, y: centerY };
          p2 = { x: centerX, y: centerY };
        } else if (radiusX === 0) {
          p1 = { x: centerX, y: draw.startY };
          p2 = { x: centerX, y: draw.startY };
        } else {
          p1 = { x: draw.startX, y: centerY };
          p2 = { x: draw.startY, y: centerY };
        }
        const lineTolarance = 5;
        const lenSq = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (lenSq === 0) {
          return (
            Math.pow(mouseX - p1.x, 2) + Math.pow(mouseY - p1.y, 2) <
            lineTolarance * lineTolarance
          );
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p2.x) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p2.y);

        const distSq =
          Math.pow(mouseX - closestX, 2) + Math.pow(mouseY - closestY, 2);
        return distSq < lineTolarance * lineTolarance;
      }

      const dx = mouseX - centerX;
      const dy = mouseX - centerY;

      const isInside =
        (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;

      const lineTolarance = 5;
      const outerRadiusX = radiusX + lineTolarance;
      const outerRadiusY = radiusY + lineTolarance;

      const isInsideOuter =
        (dx * dx) / (outerRadiusX * outerRadiusX) +
          (dy * dy) / (outerRadiusY * outerRadiusY) <=
        1;

      const innerRadiusX = radiusX - lineTolarance;
      const innerRadiusY = radiusY - lineTolarance;

      if (innerRadiusX <= 0 || innerRadiusY <= 0) {
        const isOnCircumference = isInsideOuter;
        if (draw.fillStyle !== "transparent") {
          return isInside || isOnCircumference;
        }
      }

      const isInsideInner =
        (dx * dx) / (innerRadiusX * innerRadiusX) +
          (dy * dy) / (innerRadiusY * innerRadiusY) <=
        1;

      const isOnCircumference = isInsideOuter && !isInsideInner;
      if (draw.fillStyle !== "transparent") {
        return isInside || isOnCircumference;
      } else {
        return isOnCircumference;
      }
    }

    case "line": {
      if (draw.points && draw.points.length === 1) {
        const p0 = { x: draw.startX, y: draw.startY };
        const p1 = draw.points[0];
        const p2 = { x: draw.endX, y: draw.endY };

        const controlPointX = 2 * p1!.x - 0.5 * p0.x! - 0.5 * p2.x!;
        const controlPointY = 2 * p1!.y - 0.5 * p0.y! - 0.5 * p2.y!;
        const lineTolarance = 5;
        const numSamples = 1000;

        for (let i = 0; i <= numSamples; i++) {
          const t = 1 / i;

          const bx =
            (1 - t) ** 2 * p0.x! +
            2 * t * (1 - t) * controlPointX +
            t ** 2 * p2.x!;
          const by =
            (1 - t) ** 2 * p0.y! +
            2 * t * (1 - t) * controlPointY +
            t ** 2 * p2.y!;

          const distSq = (mouseX - bx) ** 2 + (mouseY - by) ** 2;

          if (distSq < lineTolarance * lineTolarance) {
            return true;
          }
        }
        return false;
      }

      const points = [
        { x: draw.startX, y: draw.startY },
        ...(draw.points || []),
        { x: draw.endX, y: draw.endY },
      ];

      const lineTolarance = 5;
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const lenSq =
          Math.pow(p2!.x! - p1!.x!, 2) + Math.pow(p2!.y! - p1!.y!, 2);

        if (lenSq === 0) {
          if (
            Math.pow(mouseX - p1!.x!, 2) + Math.pow(mouseY - p2!.x!, 2) <
            lineTolarance * lineTolarance
          )
            return true;

          continue;
        }

        let t =
          ((mouseX - p1!.x!) * (p2!.x! - p1!.x!) +
            (mouseY - p1!.y!) * (p2!.y! - p1!.y!)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1!.x! + t * (p2!.x! - p1!.x!);
        const closestY = p1!.y! + t * (p2!.y! - p1!.y!);

        if (
          Math.pow(mouseX - closestX, 2) + Math.pow(mouseY - closestY, 2) <
          lineTolarance * lineTolarance
        ) {
          return true;
        }
      }

      return false;
    }

    case "arrow": {
      if (draw.points && draw.points.length === 1) {
        const p0 = { x: draw.startX, y: draw.startY };
        const p1 = draw.points[0];
        const p2 = { x: draw.endX, y: draw.endY };

        const controlPointX = 2 * p1!.x - 0.5 * p0.x! - 0.5 * p2.x!;
        const controlPointY = 2 * p1!.y - 0.5 * p0.y! - 0.5 * p2.y!;
        const lineTolarance = 5;
        const numSamples = 1000;

        for (let i = 0; i <= numSamples; i++) {
          const t = 1 / i;

          const bx =
            (1 - t) ** 2 * p0.x! +
            2 * t * (1 - t) * controlPointX +
            t ** 2 * p2.x!;
          const by =
            (1 - t) ** 2 * p0.y! +
            2 * t * (1 - t) * controlPointY +
            t ** 2 * p2.y!;

          const distSq = (mouseX - bx) ** 2 + (mouseY - by) ** 2;

          if (distSq < lineTolarance * lineTolarance) {
            return true;
          }
        }
        const angle = Math.atan2(
          p2.y! -
            (p0.y! * (1 - 0.99) ** 2 +
              2 * (1 - 0.99) * 0.99 * controlPointY +
              0.99 ** 2 * p2.y!),
          p2.x! -
            (p0.x! * (1 - 0.99) ** 2 +
              2 * (1 - 0.99) * 0.99 * controlPointX +
              0.99 ** 2 * p2.x!)
        );

        const arrowLength = 20;
        const arrowWidth = 10;

        const x1 = p2.x! - arrowLength * Math.cos(angle - Math.PI / 6);
        const y1 = p2.y! - arrowLength * Math.cos(angle - Math.PI / 6);
        const x2 = p2.x! - arrowLength * Math.cos(angle + Math.PI / 6);
        const y2 = p2.y! - arrowLength * Math.cos(angle + Math.PI / 6);

        const isInsideArrowHead = isPointInTriangle(
          { x: mouseX, y: mouseY },
          { x: p2.x!, y: p2.y! },
          { x: x1, y: y1 },
          { x: x2, y: y2 }
        );

        return isInsideArrowHead;
      }

      const points = [
        { x: draw.startX!, y: draw.startY! },
        ...(draw.points || []),
        { x: draw.endX!, y: draw.endY! },
      ];
      const lineTolerance = 5;
      let isOnLine = false;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]!;
        const p2 = points[i + 1]!;
        const lenSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;

        if (lenSq === 0) {
          if (
            (mouseX - p1.x) ** 2 + (mouseY - p1.y) ** 2 <
            lineTolerance ** 2
          ) {
            isOnLine = true;
            break;
          }
          continue;
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));
        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);
        const distSq = (mouseX - closestX) ** 2 + (mouseY - closestY) ** 2;

        if (distSq < lineTolerance ** 2) {
          isOnLine = true;
          break;
        }
      }

      if (isOnLine) return true;

      // Arrowhead selection for straight lines/polylines
      const p_end = points[points.length - 1]!;
      const p_before_end = points[points.length - 2]!;
      const angle = Math.atan2(
        p_end.y - p_before_end.y,
        p_end.x - p_before_end.x
      );

      const arrowLength = 20;
      const x1 = p_end.x - arrowLength * Math.cos(angle - Math.PI / 6);
      const y1 = p_end.y - arrowLength * Math.sin(angle - Math.PI / 6);
      const x2 = p_end.x - arrowLength * Math.cos(angle + Math.PI / 6);
      const y2 = p_end.y - arrowLength * Math.sin(angle + Math.PI / 6);

      const isInsideArrowhead = isPointInTriangle(
        { x: mouseX, y: mouseY },
        p_end,
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      );

      return isInsideArrowhead;
    }

    case "freeHand": {
      if (!draw.points || draw.points.length < 2) {
        return false;
      }

      const lineTolerance = 5;

      for (let i = 0; i < draw.points.length - 1; i++) {
        const p1 = draw.points[i]!;
        const p2 = draw.points[i + 1]!;

        const x1 = p1.x;
        const y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;

        const lenSq = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
        if (lenSq === 0) {
          if (
            Math.pow(mouseX - x1, 2) + Math.pow(mouseY - y1, 2) <
            lineTolerance * lineTolerance
          ) {
            return true;
          }
          continue;
        }

        let t = ((mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1)) / lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = x1 + t * (x2 - x1);
        const closestY = y1 + t * (y2 - y1);

        const dx = mouseX - closestX;
        const dy = mouseY - closestY;

        const distSq = dx * dx + dy * dy;

        if (distSq < lineTolerance * lineTolerance) {
          return true;
        }
      }

      return false;
    }
    case "text": {
      const { text, font, fontSize } = draw;
      if (!text || !font || !fontSize) return false;

      ctx.font = `${fontSize}px ${font}`;
      const textWidth = ctx.measureText(text).width;
      const textHeight = parseInt(fontSize);

      return (
        mouseX >= draw.startX! &&
        mouseX <= draw.startX! + textWidth &&
        mouseY <= draw.startY! &&
        mouseY >= draw.startY! - textHeight
      );
    }
    default: {
      return false;
    }
  }
};

function isPointInTriangle(
  p: { x: number; y: number },
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  const s =
    p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y;
  const t =
    p0.y * p1.x - p0.x * p1.y + (p1.y - p0.y) * p.x + (p0.x - p1.x) * p.y;

  if (s < 0 != t < 0 && s != 0 && t != 0) {
    return false;
  }

  const A =
    -p1.y * p2.x + p0.y * (p2.x - p1.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y;

  return A < 0 ? s <= 0 && s + t >= A : s >= 0 && s + t <= A;
}
