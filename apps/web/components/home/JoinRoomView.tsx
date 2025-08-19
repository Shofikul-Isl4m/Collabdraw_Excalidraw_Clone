"use client";
import { useActionState, useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { redirect } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks/redux";
import { setHomeView } from "@/features/meetdraw/appSlice";

import { Input } from "@repo/ui/components/ui/input";
import { SubmitButton } from "../common/SubmitButton";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import { joinRoomAction } from "@/actions/roomAction";

const JoinRoomView = () => {
  const dispatch = useAppDispatch();

  const [code, setCode] = useState(""); // Controlled OTP code state

  const [state, formAction, isPending] = useActionState(joinRoomAction, {
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
      <div className="flex w-full items-center justify-between p-6">
        <div className="font-medium text-2xl">Join Draw </div>
        <button
          onClick={() => dispatch(setHomeView("meetdraws"))}
          className="cursor-pointer"
        >
          <RxCross1 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col w-full h-full items-center justify-center gap-2">
        <div className="w-1/3 ">
          <form
            className="flex flex-col items-center gap-3"
            action={formAction}
          >
            <div>
              {" "}
              <InputOTP
                id="joinCode"
                maxLength={6}
                value={code}
                onChange={setCode}
              >
                <InputOTPGroup className="flex items-center gap-2.5">
                  {/* Slots 0,1,2 with placeholders 8 2 w when empty */}
                  <InputOTPSlot
                    index={0}
                    className="relative h-14 w-14 rounded-2xl border-0 bg-[#282828] text-[22px] font-medium text-[#EDEDED] shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_2px_rgba(199,199,199,0.25)] before:pointer-events-none before:absolute before:inset-0 before:flex before:items-center before:justify-center empty:bg-white/5 empty:text-white empty:shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_7px_rgba(199,199,199,0.25),inset_0_0_7px_rgba(199,199,199,0.25)] empty:before:text-white/60 empty:before:content-['8']"
                  />
                  <InputOTPSlot
                    index={1}
                    className="relative h-14 w-14 rounded-2xl border-0 bg-[#282828] text-[22px] font-medium text-[#EDEDED] shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_2px_rgba(199,199,199,0.25)] before:pointer-events-none before:absolute before:inset-0 before:flex before:items-center before:justify-center empty:bg-white/5 empty:text-white empty:shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_7px_rgba(199,199,199,0.25),inset_0_0_7px_rgba(199,199,199,0.25)] empty:before:text-white/60 empty:before:content-['2']"
                  />
                  <InputOTPSlot
                    index={2}
                    className="relative h-14 w-14 rounded-2xl border-0 bg-[#282828] text-[22px] font-medium text-[#EDEDED] shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_2px_rgba(199,199,199,0.25)] before:pointer-events-none before:absolute before:inset-0 before:flex before:items-center before:justify-center empty:bg-white/5 empty:text-white empty:shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_7px_rgba(199,199,199,0.25),inset_0_0_7px_rgba(199,199,199,0.25)] empty:before:text-white/60 empty:before:content-['w']"
                  />

                  {/* Separator */}
                  <div className="h-[5px] w-[18px] rounded-full bg-[#282828]" />

                  {/* Slots 3,4,5 */}
                  <InputOTPSlot
                    index={3}
                    className="h-14 w-14 rounded-2xl border-0 bg-[#282828] text-[22px] font-medium text-[#EDEDED] shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_2px_rgba(199,199,199,0.25)] empty:bg-white/5 empty:text-white empty:shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_7px_rgba(199,199,199,0.25),inset_0_0_7px_rgba(199,199,199,0.25)]"
                  />
                  <InputOTPSlot
                    index={4}
                    className="h-14 w-14 rounded-2xl border-0 bg-[#282828] text-[22px] font-medium text-[#EDEDED] shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_2px_rgba(199,199,199,0.25)] empty:bg-white/5 empty:text-white empty:shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_7px_rgba(199,199,199,0.25),inset_0_0_7px_rgba(199,199,199,0.25)]"
                  />
                  <InputOTPSlot
                    index={5}
                    className="h-14 w-14 rounded-2xl border-0 bg-[#282828] text-[22px] font-medium text-[#EDEDED] shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_2px_rgba(199,199,199,0.25)] empty:bg-white/5 empty:text-white empty:shadow-[0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08),0_2px_8px_-3px_rgba(0,0,0,0.25),inset_0_0_7px_rgba(199,199,199,0.25),inset_0_0_7px_rgba(199,199,199,0.25)]"
                  />
                </InputOTPGroup>
              </InputOTP>
              <Input type="hidden" name="joinCode" value={code} />
              <SubmitButton
                className="w-full mt-5   cursor-pointer text-xl bg-black text-white"
                pending={isPending}
                loadingText="Joining..."
              >
                {isPending ? "Joining..." : "Join Room"}
              </SubmitButton>
            </div>
            {state.message ? (
              state.message.includes("success") ? (
                <p className="text-center text-sm text-green-500">
                  {state.message}
                </p>
              ) : (
                <p className="text-center text-sm text-red-500">
                  {state.message}
                </p>
              )
            ) : null}
          </form>
        </div>
      </div>
    </>
  );
};

export default JoinRoomView;
