import { Action, Draw, Rooms, User } from "@/types";
import { act } from "react";

export const pushToUndoRedoArrayRef = (
  action: Action,
  undoRedoArray: Action[],
  undoRedoIndex: number,
  socket: WebSocket,
  userId: string,
  roomId: string
) => {
  if (undoRedoArray.length > 50) {
    undoRedoArray.shift();
  }

  if (undoRedoIndex < undoRedoArray.length - 1) {
    undoRedoArray.splice(
      undoRedoIndex + 1,
      undoRedoArray.length - 1 - undoRedoIndex
    );
  }

  undoRedoArray.push(action);
  undoRedoIndex = undoRedoArray.length - 1;
  return { undoRedoArray, undoRedoIndex };
};

export const performAction = (action: Action, diagrams: Draw[]) => {
  switch (action.type) {
    case "create":
      diagrams.push(action.modifiedDraw!);
      break;
    case "move":
    case "resize":
    case "edit":
      diagrams.forEach((diagram, index) => {
        if (diagram.id === action.originalDraw?.id) {
          diagrams[index] = action.modifiedDraw!;
        }
      });
      break;

    case "erase":
      diagrams = diagrams.filter((diagram) => {
        diagram.id !== action.originalDraw?.id;
      });
      break;
  }

  return diagrams;
};
