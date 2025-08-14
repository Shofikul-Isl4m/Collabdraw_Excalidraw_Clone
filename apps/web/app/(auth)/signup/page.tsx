import SignupForm from "@/components/auth/SignupForm";
import { cookies } from "next/headers";

export default async function page() {
  const jwtCookie = (await cookies()).get("jwt");
  return (
    <div className=" h-screen w-screen">
      <div className="font-extrabold  bg-red-500 p-7 text-3xl">CollabDraw</div>
      <div className="w-full flex items-center justify-center">
        <SignupForm jwtCookie={jwtCookie || null} />
      </div>
    </div>
  );
}
