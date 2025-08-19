import { JoinRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import { customAlphabet } from "nanoid";

const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
const generateJoinCode = customAlphabet(alphabet, 6);

export async function createRoomController(req: Request, res: Response) {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({
      message: "userid not found",
    });
    return;
  }

  const { title } = req.body;
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({
      message: "Room title is required",
    });
    return;
  }

  const joinCode = generateJoinCode();

  try {
    const room = await prismaClient.room.create({
      data: {
        title: title.trim(),
        joinCode,
        adminId: userId,
        participants: { connect: [{ id: userId }] },
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
        adminId: true,
      },
    });

    res.status(201).json({
      message: "room created successful",
      room,
    });
  } catch (error) {
    console.error("error room creation ", error);
    res.status(500).json({
      message: "error occured during room creation.try again later",
    });
  }
}

export async function joinRoomController(req: Request, res: Response) {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({
      message: "userid not found",
    });
    return;
  }

  const validatedInput = JoinRoomSchema.safeParse(req.body);
  if (!validatedInput.success) {
    res.status(404).json({
      message: "Invalid Input",
    });
    return;
  }

  const { joinCode } = validatedInput.data;

  try {
    const room = await prismaClient.room.update({
      where: {
        joinCode,
      },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
        adminId: true,
        participants: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "join room succesfull",
      room: room,
    });
  } catch (error) {
    console.error("error join room", error);
    res.status(500).json({
      message: "An error occurred while joining the room. Please try again.",
    });
  }
}

export async function fetchAllRoomsController(req: Request, res: Response) {
  const userId = req.userId;
  const search = req.query.search as string | undefined;
  if (!userId) {
    res.status(401).json({
      message: "User Id not found",
    });
    return;
  }
  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
        ...(search && {
          OR: [{ title: { contains: search, mode: "insensitive" } }],
        }),
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
        createdAt: true,
        admin: {
          select: {
            username: true,
          },
        },
        adminId: true,
        Chat: {
          take: 1,
          orderBy: {
            serialNumber: "desc",
          },
          select: {
            user: {
              select: {
                username: true,
              },
            },
            content: true,
            createdAt: true,
          },
        },
        Draw: {
          take: 10,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const sortedRooms = rooms.sort((a, b) => {
      const aLatestChat = a.Chat[0]?.createdAt || a.createdAt;
      const bLatestChat = b.Chat[0]?.createdAt || b.createdAt;
      return new Date(bLatestChat).getTime() - new Date(aLatestChat).getTime();
    });

    res.json({
      message: "Rooms fetched successfully",
      rooms: sortedRooms,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Error fetching rooms",
    });
  }
}
