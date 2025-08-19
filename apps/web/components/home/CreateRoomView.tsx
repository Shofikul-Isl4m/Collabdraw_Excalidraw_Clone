"use client";

import { useActionState } from "react";

import { RxCross1 } from "react-icons/rx";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks/redux";
import { createRoomAction } from "@/actions/roomAction";
import { setHomeView } from "@/features/meetdraw/appSlice";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "./StateButton";
import { SubmitButton } from "../common/SubmitButton";

const CreateRoomView = () => {
  const dispatch = useAppDispatch();
  const [state, formAction, isPending] = useActionState(createRoomAction, {
    message: "",
    room: undefined,
  });

  useEffect(() => {
    if (state.room) {
      redirect(`/canvas/${state.room.id}`);
    }
  }, [state.room]);

  return (
    <>
      <div className="flex w-full items-center justify-between p-6 border-gray-600 ">
        <h3 className="text-2xl font-medium">Create Draw</h3>
        <button
          onClick={() => dispatch(setHomeView("meetdraws"))}
          className="cursor-pointer"
        >
          <RxCross1 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col w-full h-full items-center justify-center gap-2">
        <div className="w-1/3 ">
          <form className="flex flex-col gap-3" action={formAction}>
            <Input
              id="title"
              name="title"
              type="text"
              required={true}
              placeholder="Enter a name for your Draw"
              className="py-2 px-4"
            />
            <SubmitButton pending={isPending} loadingText="Creating...">
              {isPending ? "Creating..." : "Create"}
            </SubmitButton>
            {state.message ? (
              state.message.includes("success") ? (
                <p className="text-center text-sm text-neutral-500">
                  {state.message}
                </p>
              ) : (
                <p className="text-center text-sm text-red-500">
                  {state.message}
                </p>
              )
            ) : (
              <></>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRoomView;
