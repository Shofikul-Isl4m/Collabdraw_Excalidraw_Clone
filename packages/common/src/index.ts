import z from "zod";

export const signUpSchema = z.object({
  username: z.string(),
  name: z.string(),
  password: z.string(),
});

export const signInschema = z.object({
  username: z.string(),
  password: z.string(),
});

export const JoinRoomSchema = z.object({
  joinCode: z.string().length(6),
});
