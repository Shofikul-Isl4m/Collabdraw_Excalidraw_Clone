"use server";
import axiosInstance from "@/lib/axiosInstance";
import { signInschema, signUpSchema } from "@repo/common/types";
import { cookies } from "next/headers";

interface FormState {
  message: string;
  user?: {
    id: string;
    username: string;
    name: string;
  };
  errors?: any;
}

export const signupAction = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  const firstname = formData.get("firstname")?.toString().trim() || "";
  const lastname = formData.get("lastname")?.toString().trim() || "";
  const username = formData.get("username")?.toString().trim() || "";
  const password = formData.get("password")?.toString().trim() || "";
  const verifypassword =
    formData.get("verifypassword")?.toString().trim() || "";

  if (password != verifypassword) {
    return {
      message: "password doesnt match",
    };
  }

  const rawFormData = {
    name: `${firstname} ${lastname}`,
    username,
    password,
  };

  const validatedFields = signUpSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "validation failed . please check your inputs",
    };
  }

  try {
    const res = await axiosInstance.post("/auth/signup", rawFormData);
    if (res.data.token) {
      (await cookies()).set("jwt", res.data.token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    return {
      user: {
        id: res.data.user.id,
        name: res.data.user.name,
        username: res.data.user.username,
      },
      message: "User created successfully.",
    };
  } catch (error) {
    console.log(error);
    if ((error as any).response.data.message) {
      return { message: (error as any).response.data.message };
    }
    return { message: "Could not create user." };
  }
};
export const signinAction = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  const username = formData.get("username")?.toString().trim() || "";
  const password = formData.get("password")?.toString().trim() || "";

  const rawFormData = {
    username,
    password,
  };

  const validatedFields = signInschema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "validation failed . please check your inputs",
    };
  }

  try {
    const res = await axiosInstance.post("/auth/signin", rawFormData);
    if (res.data.token) {
      (await cookies()).set("jwt", res.data.token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    return {
      user: {
        id: res.data.user.id,
        name: res.data.user.name,
        username: res.data.user.username,
      },
      message: "User signin successfully.",
    };
  } catch (error) {
    console.log(error);
    if ((error as any).response.data.message) {
      return { message: (error as any).response.data.message };
    }
    return { message: "Could not create user." };
  }
};
