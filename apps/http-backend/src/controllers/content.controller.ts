import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export async function getHomeInfo(req: Request, res: Response) {
  const { title } = req.query;
  const userId = req.userId;
  if (!userId) {
    res.status(400).json({
      message: "userid is required",
    });
  }

  if (title) {
    try {
      const rooms = prismaClient.room.findMany({
        where: {
          participants: {
            some: { id: userId },
          },
        },
        select: {
          id: true,
          title: true,
          joinCode: true,
          Chat: {
            take: 1,
            orderBy: { serialNumber: "desc" },

            select: {
              user: {
                select: {
                  name: true,
                },
              },
              content: true,
            },
          },
        },
      });

      res.json({
        rooms,
      });
    } catch (error) {
      console.error(error);
      res.status(401).json({
        message: "could not fetch room",
      });
    }
  }

  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
        Chat: {
          take: 1,
          orderBy: {
            serialNumber: "desc",
          },
          select: {
            user: {
              select: {
                name: true,
              },
            },
            content: true,
          },
        },
      },
    });
    res.json({
      rooms,
    });
  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: "Could not fetch rooms",
    });
  }
}

export async function getAllChatMessages(req: Request, res: Response) {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({
      message: "user Id required",
    });
  }

  const { roomId } = req.params;
  const { lastSrNo } = req.query;

  if (!roomId) {
    res.status(400).json({
      message: "roomId required",
    });
    return;
  }
  try {
    const room = await prismaClient.room.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
        title: true,
        joinCode: true,
      },
    });

    if (!room) {
      res.status(404).json({
        message: "room not found",
      });
      return;
    }
    let message;
    if (lastSrNo !== undefined) {
      message = await prismaClient.chat.findMany({
        where: {
          roomId: roomId,
          serialNumber: {
            lt: parseInt(lastSrNo as string),
          },
        },
        select: {
          id: true,
          content: true,
          serialNumber: true,
          userId: true,
          user: {
            select: {
              username: true,
            },
          },
          roomId: true,
          room: {
            select: {
              title: true,
            },
          },
        },
        take: 25,
        orderBy: {
          serialNumber: "desc",
        },
      });
    } else {
      message = await prismaClient.chat.findMany({
        where: {
          roomId: roomId,
        },
        select: {
          id: true,
          content: true,
          serialNumber: true,
          userId: true,
          user: {
            select: {
              username: true,
            },
          },
          roomId: true,
          room: {
            select: {
              title: true,
            },
          },
        },
        take: 25,
        orderBy: {
          serialNumber: "desc",
        },
      });
    }

    res.json({
      message: message.reverse(),
    });
  } catch (error) {
    console.error("error fetching chat messages", error);
    res.status(500).json({
      message: "Could not fetch messages",
    });
  }
}

export async function getAllDraws(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      message: "userId required",
    });
  }

  const { roomId } = req.params;
  try {
    const draws = await prismaClient.draw.findMany({
      where: {
        roomId: roomId,
      },
    });

    res.status(200).json({
      draws,
    });
  } catch (error) {
    console.error("error fetching draws", error);
    res.status(500).json({
      message: "error occure during fetching draws,try again later ",
    });
  }
}
