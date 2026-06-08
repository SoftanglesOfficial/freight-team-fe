"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Title,
    Box,
    Group,
    TextInput,
    Card,
    Avatar,
    Text,
    Stack,
    ScrollArea,
    Textarea,
    ActionIcon,
    Badge,
    Loader,
    Button,
    SegmentedControl,
} from "@mantine/core";
import {
    IconSearch,
    IconSend,
    IconMessageCircle,
    IconArchive,
    IconTrash,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    useGetLiveChatsQuery,
    useGetLiveChatMessagesQuery,
    useSendLiveChatMessageMutation,
    useArchiveLiveChatMutation,
    useMarkMessagesAsSeenMutation,
    useDeleteLiveChatMutation,
} from "@/hooks/live-chat.hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getSocket } from "@/lib/socket"; // We might need a separate socket for admin or use same
import { LiveChat } from "@/hooks/Api";
import { useAdminContext } from "@/contexts/AdminContext";
// Actually admin listens to events too?
// The socket.ts is designed for anon user with anon_id.
// Admin authentication is different.
// The existing `socket.gateway` handles admin join?
// Admin gets `emit_socket_event` directed to them.
// We need to ensure Admin connects to socket with valid auth token.
// The `socket.ts` I wrote uses `anon_id`.
// Existing `socket.gateway` handles Auth via token?
// Let's check `socket.gateway` handleConnection.
// It checks `client.handshake.query.token`.
// My `socket.ts` only sent `anon_id`.
// Admin needs a socket connection with token.

dayjs.extend(relativeTime);

export default function AdminLiveChatPage() {
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const { selectedCustomer } = useAdminContext();
    const activeChatRef = useRef<string | null>(null);
    const [messageText, setMessageText] = useState("");
    const viewport = useRef<HTMLDivElement>(null);
    const { data: liveChats, isLoading: isLoadingChats, refetch: refetchChats } = useGetLiveChatsQuery(statusFilter === "archived");

    // Fetch messages
    const { data: messages, refetch: refetchMessages } = useGetLiveChatMessagesQuery(selectedChatId || "");

    // Mutations
    const sendMessageMutation = useSendLiveChatMessageMutation();
    const archiveChatMutation = useArchiveLiveChatMutation();
    const deleteChatMutation = useDeleteLiveChatMutation();
    const markAsSeenMutation = useMarkMessagesAsSeenMutation();

    const [allMessages, setAllMessages] = useState<any[]>([]);

    // Sync query messages to local state
    useEffect(() => {
        if (messages) {
            setAllMessages(messages);
            scrollToBottom();
        }
    }, [messages]);

    const scrollToBottom = (force = false) => {
        if (viewport.current) {
            requestAnimationFrame(() => {
                if (viewport.current) {
                    viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'instant' });
                }
            });
        }
    };

    // Initialize Socket
    useEffect(() => {
        const socket = getSocket();

        socket.on('live_chat_message', (data: any) => {
            console.log("Admin New Message:", data);
            // Deduplicate if it's our own message reflected back
            setAllMessages((prev) => {
                const isDuplicate = prev.length > 0 &&
                    prev[prev.length - 1].message === data.message &&
                    prev[prev.length - 1].sender_id === data.sender_id;
                if (isDuplicate) return prev;
                return [...prev, data];
            });
            scrollToBottom();
            refetchChats(); // Update unread stats/last message in list

            // If it's the currently selected chat, mark as seen
            if (activeChatRef.current === data.chat_id && activeChatRef.current) {
                markAsSeenMutation.mutate({ chatId: activeChatRef.current, isAdmin: true });
            }
        });

        socket.on('live_chat_created', (data: any) => {
            refetchChats();
        });

        return () => {
            socket.off('live_chat_message');
            socket.off('live_chat_created');
        };
    }, [refetchChats]);

    // Initial refetch on chat selection
    useEffect(() => {
        if (selectedChatId) {
            refetchMessages();
            markAsSeenMutation.mutate({ chatId: selectedChatId, isAdmin: true });
        }
    }, [selectedChatId]);


    const filteredChats = (liveChats || []).filter((chat: LiveChat) => {
        // Filter by focus customer email if active
        if (selectedCustomer && chat.user_email !== selectedCustomer.email) {
            return false;
        }

        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            chat.subject.toLowerCase().includes(searchLower) ||
            chat.user_name?.toLowerCase().includes(searchLower) ||
            chat.user_email?.toLowerCase().includes(searchLower)
        );
    });

    const selectedChat = (liveChats || []).find((c: LiveChat) => c._id === selectedChatId);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedChatId || !user) return;

        const msg = messageText;
        setMessageText(""); // Reset input immediately

        // Optimistic UI
        const optimisticMsg = {
            _id: Math.random().toString(), // temp id
            message: msg,
            sender_id: user._id,
            chat_id: selectedChatId,
            createdAt: new Date().toISOString(),
        };

        setAllMessages((prev) => [...prev, optimisticMsg]);
        scrollToBottom();

        try {
            await sendMessageMutation.mutateAsync({
                chatId: selectedChatId,
                message: msg,
                senderId: user._id,
            });
        } catch (error) {
            console.error("Failed to send", error);
            // Remove optimistic message on error
            setAllMessages((prev) => prev.filter(m => m !== optimisticMsg));
        }
    };

    const handleArchive = async () => {
        if (!selectedChatId) return;
        if (confirm("Are you sure you want to archive this chat?")) {
            await archiveChatMutation.mutateAsync(selectedChatId);
            setSelectedChatId(null);
        }
    }

    const handleDeleteChat = async () => {
        if (!selectedChatId) return;
        if (confirm("Are you sure you want to permanently delete this chat and all its messages? This action cannot be undone.")) {
            await deleteChatMutation.mutateAsync(selectedChatId);
            setSelectedChatId(null);
        }
    }

    return (
        <Box>
            <Group mb="xl" justify="space-between">
                <Title order={1} c="gray.8">Live Chat Support</Title>
                <SegmentedControl
                    value={statusFilter}
                    onChange={(value: any) => {
                        setStatusFilter(value);
                        setSelectedChatId(null);
                    }}
                    data={[
                        { label: 'Active', value: 'active' },
                        { label: 'Archived', value: 'archived' },
                    ]}
                    color="#EA4745"
                />
            </Group>

            <Group mb="xl" gap="md">
                <TextInput
                    placeholder="Search subjects, names..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    style={{ flex: 1 }}
                />
            </Group>

            <Card shadow="sm" padding={0} withBorder style={{ height: "calc(100vh - 250px)", minHeight: "600px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Box style={{ flex: 1, display: "flex", flexDirection: "row", minHeight: 0, overflow: "hidden" }}>
                    {/* Left Panel */}
                    <Box style={{ width: "350px", borderRight: "1px solid #e9ecef", display: "flex", flexDirection: "column", minHeight: 0 }}>
                        <ScrollArea style={{ flex: 1 }} type="auto">
                            <Stack gap={0}>
                                {isLoadingChats ? (
                                    <Box p="md"><Loader size="sm" type="dots" /></Box>
                                ) : filteredChats.length === 0 ? (
                                    <Box p="md"><Text c="dimmed">No active chats</Text></Box>
                                ) : (
                                    filteredChats.map((chat: any) => (
                                        <Box
                                            key={chat._id}
                                            onClick={() => setSelectedChatId(chat._id)}
                                            style={{
                                                padding: "1rem",
                                                cursor: "pointer",
                                                backgroundColor: selectedChatId === chat._id ? "#ffedecff" : "transparent",
                                                borderBottom: "1px solid #e9ecef",
                                                "&:hover": { backgroundColor: "#e0f2f1" }
                                            }}
                                        >
                                            <Group wrap="nowrap">
                                                <Avatar color="#EA4745" radius="xl"><IconMessageCircle size={20} /></Avatar>
                                                <Box style={{ flex: 1, minWidth: 0 }}>
                                                    <Group justify="space-between" wrap="nowrap">
                                                        <Text fw={500} size="sm" truncate>{chat.subject}</Text>
                                                        <Text size="xs" c="dimmed">{dayjs(chat.updatedAt).fromNow(true)}</Text>
                                                    </Group>
                                                    <Text size="xs" c="dimmed" truncate>{chat.user_name || 'Anonymous'}</Text>
                                                    {chat.unread_stats && chat.unread_stats.for_admins > 0 && (
                                                        <Badge size="xs" color="red" mt={4}>{chat.unread_stats.for_admins}</Badge>
                                                    )}
                                                </Box>
                                            </Group>
                                        </Box>
                                    ))
                                )}
                            </Stack>
                        </ScrollArea>
                    </Box>

                    {/* Right Panel */}
                    <Box style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                        {selectedChat ? (
                            <>
                                <Box p="md" style={{ borderBottom: "1px solid #e9ecef", backgroundColor: "#f8f9fa" }}>
                                    <Group justify="space-between">
                                        <Group>
                                            <Avatar color="#EA4745" radius="xl">{selectedChat.user_name?.[0] || 'A'}</Avatar>
                                            <Box>
                                                <Text fw={500}>{selectedChat.subject}</Text>
                                                <Text size="xs" c="dimmed">
                                                    {selectedChat.user_name} &bull; {selectedChat.user_email}
                                                </Text>
                                            </Box>
                                        </Group>
                                        <Group>
                                            <Button size="xs" color="gray" variant="light" leftSection={<IconArchive size={14} />} onClick={handleArchive} disabled={selectedChat.is_archived}>
                                                {selectedChat.is_archived ? 'Archived' : 'Archive'}
                                            </Button>
                                            {selectedChat.is_archived && (
                                                <Button size="xs" color="red" variant="light" leftSection={<IconTrash size={14} />} onClick={handleDeleteChat}>
                                                    Delete
                                                </Button>
                                            )}
                                        </Group>
                                    </Group>
                                </Box>

                                <ScrollArea p="md" style={{ flex: 1 }} viewportRef={viewport} type="auto">
                                    <Stack gap="sm">
                                        {(!allMessages || allMessages.length === 0) && (
                                            <Text c="dimmed" ta="center" mt="xl">No messages yet.</Text>
                                        )}
                                        {allMessages?.map((msg: any) => {
                                            const isAdmin = msg.sender_id === user?._id || msg.sender_id !== selectedChat.anon_id;
                                            return (
                                                <Group key={msg._id} justify={isAdmin ? 'flex-end' : 'flex-start'}>
                                                    <Box
                                                        style={{
                                                            padding: "0.5rem 1rem",
                                                            borderRadius: "8px",
                                                            backgroundColor: isAdmin ? "#EA4745" : "#f1f3f5",
                                                            color: isAdmin ? "white" : "black",
                                                            maxWidth: "70%"
                                                        }}
                                                    >
                                                        <Text c={isAdmin ? "white" : "black"} size="sm">{msg.message}</Text>
                                                        <Text c={isAdmin ? "white" : "black"} size="xs" style={{ opacity: 0.7 }} ta="right" mt={4}>
                                                            {dayjs(msg.createdAt).format('HH:mm')}
                                                        </Text>
                                                    </Box>
                                                </Group>
                                            )
                                        })}
                                    </Stack>
                                </ScrollArea>

                                <Box p="md" style={{ borderTop: "1px solid #e9ecef", backgroundColor: "#f8f9fa" }}>
                                    <Group>
                                        <Textarea
                                            placeholder="Reply..."
                                            autosize
                                            minRows={1}
                                            maxRows={4}
                                            style={{ flex: 1 }}
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <ActionIcon size="lg" variant="gradient" gradient={{ from: "#EA4745", to: "#FF9200" }} onClick={handleSendMessage} disabled={!messageText.trim()}>
                                            <IconSend size={18} />
                                        </ActionIcon>
                                    </Group>
                                </Box>
                            </>
                        ) : (
                            <Box style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Stack align="center">
                                    <IconMessageCircle size={48} color="#ced4da" />
                                    <Text c="dimmed">Select a chat to view</Text>
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Card>
        </Box>
    );
}
