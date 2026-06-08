"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import http from "./Http";

// Manual types since Api.ts might be missing LiveChat definitions
// Adjust based on actual DTOs in backend

import { CreateLiveChatDto, LiveChatMessageForAdminDto } from "./Api";

// Using 'any' for LiveChat and LiveChatMessage as they are missing in Api.ts response types
// to comply with "dont create interfaces" request.

const extractErrorMessage = (error: any) => {
    return error.response?.data?.message || error.message || "An error occurred";
};

// Hooks

export const useGetLiveChatsQuery = (archived?: boolean) => {
    return useQuery({
        queryKey: ["live-chats", archived],
        queryFn: async () => {
            const res = await http.instance.get(`/live-chat${archived ? '?archived=true' : ''}`);
            return res.data as unknown as any[];
        }
    });
};

export const useGetTotalUnreadForAdminQuery = () => {
    return useQuery({
        queryKey: ["live-chat-total-unread"],
        queryFn: async () => {
            const res = await http.liveChat.liveChatControllerGetTotalUnreadForAdmin();
            return res.data as number;
        }
    });
};

export const useGetLiveChatQuery = (id: string) => {
    return useQuery({
        queryKey: ["live-chat", id],
        queryFn: async () => {
            const res = await http.liveChat.liveChatControllerFindOne(id);
            return res.data;
        },
        enabled: !!id
    });
};

// Fetch active chat by anon_id (returns null if not found)
export const useGetActiveLiveChatByAnonIdQuery = (anonId: string | null) => {
    return useQuery({
        queryKey: ["live-chat-by-anon", anonId],
        queryFn: async () => {
            // Using http.instance since new endpoint may not be in generated Api.ts yet
            const res = await http.instance.get(`/live-chat/anon/${anonId}`);
            return res.data;
        },
        enabled: !!anonId,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};


export const useGetLiveChatMessagesQuery = (id: string) => {
    return useQuery({
        queryKey: ["live-chat-messages", id],
        queryFn: async () => {
            const res = await http.liveChat.liveChatControllerGetMessages(id);
            return res.data;
        },
        enabled: !!id,
        retry: false
    });
};


export const useGetLiveChatMessagesByAnonIdQuery = (anonId: string | null) => {
    return useQuery({
        queryKey: ["live-chat-messages", anonId],
        queryFn: async () => {
            const res = await http.liveChat.liveChatControllerGetMessagesByAnonId(anonId!);
            return res.data;
        },
        enabled: !!anonId,
        retry: false
    });
};

// Send message from Admin
export const useSendLiveChatMessageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ chatId, message, senderId }: { chatId: string, message: string, senderId: string }) => {
            // Admin sends message
            const res = await http.liveChat.liveChatControllerMessageToAdmin(chatId, {
                message,
                sender_id: senderId,
                chat_id: chatId
            });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["live-chat-messages", variables.chatId] });
            notifications.show({ title: 'Sent', message: 'Message sent', color: 'green' });
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: extractErrorMessage(error), color: 'red' });
        }
    });
}

// Archive/Close chat
export const useArchiveLiveChatMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await http.liveChat.liveChatControllerClose(id);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["live-chats"] });
            queryClient.invalidateQueries({ queryKey: ["live-chat-by-anon"] });
            queryClient.invalidateQueries({ queryKey: ["live-chat-messages"] });
            notifications.show({ title: 'Success', message: 'Chat archived', color: 'green' });
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: extractErrorMessage(error), color: 'red' });
        }
    });
}

export const useDeleteLiveChatMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await http.liveChat.liveChatControllerRemove(id);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["live-chats"] });
            notifications.show({ title: 'Success', message: 'Chat deleted permanently', color: 'green' });
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: extractErrorMessage(error), color: 'red' });
        }
    });
}

export const useCreateLiveChatMutation = () => {
    return useMutation({
        mutationFn: async (data: CreateLiveChatDto) => {
            const res = await http.liveChat.liveChatControllerCreate(data);
            return res.data as any;
        }
    });
}

export const useSendLiveChatMessageAsUserMutation = () => {
    return useMutation({
        mutationFn: async ({ chat_id, message, sender_id }: LiveChatMessageForAdminDto) => {
            const res = await http.liveChat.liveChatControllerMessageToAdmin(chat_id, {
                message,
                chat_id,
                sender_id
            });
            return res.data;
        }
    });
}

export const useMarkMessagesAsSeenMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ chatId, isAdmin }: { chatId: string, isAdmin: boolean }) => {
            const endpoint = isAdmin ? `/live-chat/${chatId}/seen` : `/live-chat/${chatId}/seen-by-user`;
            const res = await http.instance.patch(endpoint);
            return res.data;
        },
        onSuccess: (_, { chatId }) => {
            queryClient.invalidateQueries({ queryKey: ["live-chats"] });
            queryClient.invalidateQueries({ queryKey: ["live-chat-messages", chatId] });
        }
    });
};