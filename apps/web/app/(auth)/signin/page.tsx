import SignInForm from "@/components/auth/SignInForm";
import { cookies } from "next/headers";

export default async function page() {
  const jwtCookie = (await cookies()).get("jwt");

  return (
    <div className="h-screen w-screen">
      <div className="font-extrabold text-3xl">Cdraw</div>
      <div className="flex items-center justify-center">
        <SignInForm jwtCookie={jwtCookie || null} />
      </div>
    </div>
  );
}
