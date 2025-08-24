"use server";

import axiosInstance from "@/lib/axiosInstance";
import { Message } from "@/types";

export const fetchAllChatMessages: (
  roomId: string,
  lastSrNo: number | undefined
) => Promise<Message[]> = async (roomId, lastSrNo) => {
  try {
    let messages: Message[] = [];
    const fetchedMessages: { data: { messages: Message[] } } =
      await axiosInstance.get(`/content/chat/${roomId}?lastSrNo=${lastSrNo}`);
    if (fetchedMessages && fetchedMessages.data.messages) {
      messages = fetchedMessages.data.messages;
    }
    return messages;
  } catch {
    return [];
  }
};
