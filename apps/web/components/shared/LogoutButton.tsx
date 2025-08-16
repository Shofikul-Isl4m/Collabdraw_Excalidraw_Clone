"use client";

import { useAction } from "next-safe-action/hooks";

// import { signoutAction } from "@/actions/authActions";

import Downitem from "../Downitem";
import { LogoutIcon } from "../icons/animated/logout";
import { signoutAction } from "@/actions/authActions";

export function LogoutButton() {
  const { execute: handleLogout } = useAction(signoutAction, {
    onSuccess: () => {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
  });

  return (
    <Downitem
      icon={<LogoutIcon />}
      title="Logout"
      onClick={() => handleLogout({})}
    />
  );
}
