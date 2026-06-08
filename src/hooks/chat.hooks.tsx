"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateChatDto,
  UpdateChatDto,
  CreateChatMessageDto,
  JoinPublicChatDto,
  CreatePublicChatMessageDto,
} from "./Api";
import { notifications } from "@mantine/notifications";
import http from "./Http";

type ApiError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};

const extractErrorMessage = (error: unknown) => {
  const fallback = "Something went wrong. Please try again.";
  if (!error) return fallback;
  const apiError = error as ApiError;
  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    (error as Error).message ||
    fallback
  );
};

export const useGetChatUnreadStatsQuery = () => {
  return useQuery({
    queryKey: ["chat-unread-stats"],
    queryFn: async () => {
      const res = await http.chat.chatControllerGetUnreadStats();
      return res.data;
    },
  });
};

export const useCreateChatMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateChatDto) => {
      const res = await http.chat.chatControllerCreate(data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Chat created",
        message: "Chat has been created successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Chat creation failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useGetChatsQuery = (
  params: {
    page?: number;
    pageSize?: number;
    user_id?: string;
    is_favorite?: boolean;
  } = {}
) => {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  return useQuery({
    queryKey: ["chats", queryParams],
    queryFn: async () => {
      const res = await http.chat.chatControllerFindAll(queryParams);
      return res.data;
    },
  });
};

export const useGetChatQuery = (id: string) => {
  return useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const res = await http.chat.chatControllerFindOne(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useUpdateChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChatDto }) => {
      const res = await http.chat.chatControllerUpdate(id, data);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch chats queries
      queryClient.invalidateQueries({ queryKey: ["chats"] });

      notifications.show({
        title: "Chat updated",
        message: "The chat has been updated successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Chat update failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useDeleteChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await http.chat.chatControllerRemove(id);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch chats queries
      queryClient.invalidateQueries({ queryKey: ["chats"] });

      notifications.show({
        title: "Chat deleted",
        message: "The chat has been deleted successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Chat deletion failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useCreateChatMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      data,
    }: {
      chatId: string;
      data: CreateChatMessageDto;
    }) => {
      const res = await http.chat.chatMessageControllerCreate(chatId, data);
      return res.data;
    },
    onSuccess: (_, { chatId }) => {
      // Invalidate chat messages and unread stats for the specific chat
      queryClient.invalidateQueries({ queryKey: ["chat-messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chat-unread-stats"] });
    },
    onError: (error) => {
      notifications.show({
        title: "Message sending failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useGetChatMessagesQuery = (
  chatId: string,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
  } = {}
) => {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  return useQuery({
    queryKey: ["chat-messages", chatId, queryParams],
    queryFn: async () => {
      const res = await http.chat.chatMessageControllerFindAll(
        chatId,
        queryParams
      );
      return res.data;
    },
    enabled: !!chatId,
  });
};

export const useMarkChatMessageAsSeenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, chatId }: { id: string; chatId: string }) => {
      const res = await http.chat.chatMessageControllerMarkAsSeen(id, chatId);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate unread stats
      queryClient.invalidateQueries({ queryKey: ["chat-unread-stats"] });
    },
    onError: (error) => {
      // Optional: Handle error silently or with minimal notification
      console.error("Failed to mark message as seen:", error);
    },
  });
};

export const useJoinPublicChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JoinPublicChatDto) => {
      const res = await http.publicChat.publicChatControllerJoinPublicChat(
        data
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate public chat rooms
      queryClient.invalidateQueries({ queryKey: ["public-chat-rooms"] });

      notifications.show({
        title: "Joined chat",
        message: "You have successfully joined the public chat.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Join chat failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useGetPublicChatRoomsQuery = () => {
  return useQuery({
    queryKey: ["public-chat-rooms"],
    queryFn: async () => {
      const res =
        await http.publicChat.publicChatControllerGetPublicChatRooms();
      return res.data;
    },
  });
};

export const useSendPublicChatMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      data,
    }: {
      chatId: string;
      data: CreatePublicChatMessageDto;
    }) => {
      const res = await http.publicChat.publicChatControllerSendMessage(
        chatId,
        data
      );
      return res.data;
    },
    onSuccess: (_, { chatId }) => {
      // Invalidate public chat messages for the specific chat
      queryClient.invalidateQueries({
        queryKey: ["public-chat-messages", chatId],
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Message sending failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useGetPublicChatMessagesQuery = (
  chatId: string,
  params: {
    limit: number;
  }
) => {
  return useQuery({
    queryKey: ["public-chat-messages", chatId, params],
    queryFn: async () => {
      const res = await http.publicChat.publicChatControllerGetMessages(
        chatId,
        params
      );
      return res.data;
    },
    enabled: !!chatId,
  });
};

export const useGetPublicChatParticipantsQuery = (chatId: string) => {
  return useQuery({
    queryKey: ["public-chat-participants", chatId],
    queryFn: async () => {
      const res = await http.publicChat.publicChatControllerGetParticipants(
        chatId
      );
      return res.data;
    },
    enabled: !!chatId,
  });
};
