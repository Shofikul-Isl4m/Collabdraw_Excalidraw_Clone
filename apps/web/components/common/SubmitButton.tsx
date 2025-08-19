import { Button } from "@repo/ui/components/ui/button";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  value?: "create-room" | "join-room" | "meetdraw" | "chat";
  onValueClick?: (
    value: "create-room" | "join-room" | "meetdraw" | "chat"
  ) => void;
  pending: boolean;
  loadingText: string;
}

export const SubmitButton = ({
  children,
  onValueClick,
  value,
  className = "",
  pending,
  loadingText,
  ...props
}: ButtonProps) => {
  return (
    <Button
      type="submit"
      {...props}
      className={`${className} hover:ring-2 hover:ring-gray-200 bg-black text-white cursor-pointer hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-800 `}
    >
      <div>{pending ? loadingText : children}</div>
    </Button>
  );
};
