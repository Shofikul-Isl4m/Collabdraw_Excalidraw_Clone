import { Action, Draw } from "@/types";

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
