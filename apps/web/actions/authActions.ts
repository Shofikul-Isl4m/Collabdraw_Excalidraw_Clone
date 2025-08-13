import { signUpSchema } from "@repo/common/types";
import { error } from "console";

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
    return {
      user: {
        id: "1",
        name: "asd",
        username: "res.data.user.username,",
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
