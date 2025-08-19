import { Button as Button2 } from "@repo/ui/components/ui/button";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  value: "create-room" | "join-room" | "meetdraw" | "chat";
  onValueClick: (
    value: "create-room" | "join-room" | "meetdraw" | "chat"
  ) => void;
}

export const Button = ({
  children,
  onValueClick,
  value,
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <Button2
      {...props}
      onClick={() => onValueClick(value)}
      className={`${className} hover:ring-2 hover:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-800 `}
    >
      {children}
    </Button2>
  );
};
