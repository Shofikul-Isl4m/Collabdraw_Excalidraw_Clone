import { Draw } from "@/types";

export const renderDraws = (
  ctx: CanvasRenderingContext2D,
  diagrams: Draw[],
  activeDraw: Draw,
  canvasCurrent: HTMLCanvasElement
) => {
  ctx.save();
  ctx.clearRect(0, 0, canvasCurrent.width, canvasCurrent.height);
  diagrams.forEach((diagram) => {
    if (diagram.strokeStyle) {
      ctx.strokeStyle = diagram.strokeStyle;
    }

    if (diagram.fillStyle) {
      ctx.fillStyle = diagram.fillStyle;
    }

    if (diagram.linewidth) {
      ctx.lineWidth = diagram.linewidth;
    }

    switch (diagram.shape) {
      case "rectangle":
        renderRectangle(ctx, diagram);
        break;
      case "diamond":
        renderDiamond(ctx, diagram);
        break;
      case "circle":
        renderCircle(ctx, diagram);
        break;
      case "line":
        renderLine(ctx, diagram);
        break;
      case "arrow":
        renderArrow(ctx, diagram);
        break;
    }
  });

  if (activeDraw) {
    switch (activeDraw.shape) {
      case "rectangle":
        renderRectangle(ctx, activeDraw);
        break;
      case "diamond":
        renderDiamond(ctx, activeDraw);
        break;
      case "circle":
        renderCircle(ctx, activeDraw);
        break;
      case "line":
        renderLine(ctx, activeDraw);
        break;
      case "arrow":
        renderArrow(ctx, activeDraw);
        break;
    }
  }

  function renderRectangle(ctx: CanvasRenderingContext2D, diagram: Draw) {
    const cornerRedius = Math.min(
      40,
      Math.min(
        Math.abs(diagram.endX! - diagram.startX!),
        Math.abs(diagram.endY! - diagram.startY!)
      ) * 0.2,
      Math.min(
        Math.min(
          Math.abs(diagram.endX! - diagram.startX!),
          Math.abs(diagram.endY! - diagram.startY!)
        ) / 2
      )
    );

    ctx.beginPath();
    ctx.roundRect(
      diagram.startX!,
      diagram.startY!,
      diagram.endX! - diagram.startX!,
      diagram.endY! - diagram.startY!,
      cornerRedius
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }

  function renderDiamond(ctx: CanvasRenderingContext2D, diagram: Draw) {
    const height = diagram.endY! - diagram.startY!;
    const width = diagram.endX! - diagram.startX!;

    const x = diagram.startX!;
    const y = diagram.startY!;

    const f = 0.2;

    const Vt = { x: x + width / 2, y: y };

    const Vr = { x: x + width, y: y + height / 2 };
    const Vl = { x: x, y: y + height / 2 };
    const Vb = { x: x + width / 2, y: y + height };

    const p_tl_t = {
      x: (1 - f) * Vt.x + f * Vl.x,
      y: (1 - f) * Vt.y + Vl.y * f,
    };
    const p_tr_t = {
      x: (1 - f) * Vt.x + f * Vr.x,
      y: (1 - f) * Vt.y + f * Vr.y,
    };
    const p_lt_l = {
      x: (1 - f) * Vl.x + f * Vt.x,
      y: (1 - f) * Vl.y + f * Vt.y,
    };
    const p_lb_l = {
      x: (1 - f) * Vl.x + f * Vb.x,
      y: (1 - f) * Vl.y + f * Vb.y,
    };

    const p_rt_r = {
      x: (1 - f) * Vr.x + f * Vt.x,
      y: (1 - f) * Vr.y + f * Vt.y,
    };
    const p_rb_r = {
      x: (1 - f) * Vr.x + f * Vb.x,
      y: (1 - f) * Vr.y + f * Vb.y,
    };

    const p_bl_b = {
      x: (1 - f) * Vb.x + f * Vl.x,
      y: (1 - f) * Vb.y + f * Vl.y,
    };
    const p_br_b = {
      x: (1 - f) * Vb.x + f * Vr.x,
      y: (1 - f) * Vb.y + f * Vr.y,
    };

    ctx.beginPath();
    ctx.moveTo(p_tl_t.x, p_tl_t.y);
    ctx.quadraticCurveTo(Vt.x, Vt.y, p_tr_t.x, p_tr_t.y);
    ctx.lineTo(p_rt_r.x, p_rt_r.y);
    ctx.quadraticCurveTo(Vr.x, Vr.y, p_rb_r.x, p_rb_r.y);
    ctx.lineTo(p_br_b.x, p_br_b.y);
    ctx.quadraticCurveTo(Vb.x, Vb.y, p_bl_b.x, p_bl_b.y);
    ctx.lineTo(p_lb_l.x, p_lb_l.y);
    ctx.quadraticCurveTo(Vl.x, Vl.y, p_lt_l.x, p_lt_l.y);
    ctx.lineTo(p_tl_t.x, p_tl_t.y);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }

  function renderCircle(ctx: CanvasRenderingContext2D, diagram: Draw) {
    const centerX = (diagram.startX! + diagram.endX!) / 2;
    const centerY = (diagram.startY! + diagram.endY!) / 2;

    const radiusX = Math.abs(diagram.endX! - diagram.startX!) / 2;
    const radiusY = Math.abs(diagram.endY! - diagram.startY!) / 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }

  function renderLine(ctx: CanvasRenderingContext2D, diagram: Draw) {
    ctx.beginPath();
    ctx.moveTo(diagram.startX!, diagram.startY!);

    const p0 = { x: diagram.startX, y: diagram.startY };
    const p2 = { x: diagram.endX, y: diagram.endY };
    const p1 = diagram.points[0];
    const controlPointX = 2 * p1!.x - 0.5 * p0!.x! - 0.5 * p2!.x!;
    const controlPointY = 2 * p1!.y - 0.5 * p0!.y! - 0.5 * p2!.y!;
    ctx.quadraticCurveTo(controlPointX, controlPointY, p2!.x!, p2!.y!);
    ctx.stroke();
    ctx.closePath();
  }

  function renderArrow(ctx: CanvasRenderingContext2D, diagram: Draw) {
    ctx.beginPath();
    ctx.moveTo(diagram.startX!, diagram.startY!);
    const p0 = { x: diagram.startX, y: diagram.startY };
    const p1 = diagram.points[0];
    const p2 = { x: diagram.endX, y: diagram.endY };
    const controlPointX = 2 * p1!.x - 0.5 * p0.x! - 0.5 * p2.x!;
    const controlPointY = 2 * p1!.y - 0.5 * p0.y! - 0.5 * p2.y!;
    ctx.quadraticCurveTo(controlPointX, controlPointY, p2.x!, p2.y!);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(diagram.startX!, diagram.startY!);

    const tangentDx = p2.x! - controlPointX;
    const tangentDy = p2.y! - controlPointY;
    const angle = Math.atan2(tangentDy, tangentDx);
    const lineLength = Math.sqrt(
      Math.pow(p2.x! - p0.x!, 2) + Math.pow(p2.y! - p0.x!, 2)
    );
    const headLength =
      Math.min(lineLength * 0.2, 20) + (diagram.linewidth ?? 1) * 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p2.x!, p2.y!);
    ctx.lineTo(
      p2.x! - headLength * Math.cos(angle - Math.PI / 10),
      p2.y! - headLength * Math.sin(angle - Math.PI / 10)
    );
    ctx.stroke();
    ctx.restore();
    ctx.closePath();
  }
};
