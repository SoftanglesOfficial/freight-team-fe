"use client";

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';
import { usePathname } from 'next/navigation';
import {
    ActionIcon,
    Button,
    Card,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
    Textarea,
    ScrollArea,
    Avatar,
    Box,
    Transition,
    ThemeIcon,
    Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconBrandMessenger, IconX, IconSend, IconMessageCircle, IconUser, IconChevronDown } from '@tabler/icons-react';
import { useCreateLiveChatMutation, useSendLiveChatMessageAsUserMutation, useGetActiveLiveChatByAnonIdQuery, useGetLiveChatMessagesByAnonIdQuery, useMarkMessagesAsSeenMutation, useArchiveLiveChatMutation } from '@/hooks/live-chat.hooks';
import { LiveChat, LiveChatMessage } from '@/hooks/Api';

// Types
// Reuse Chat interface or use LiveChat from hooks (better to use from hooks but keep local simplifying if needed. Let's use LiveChat type)
const ANON_ID_KEY = 'live_chat_anon_id';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function LiveChatWidget() {
    const pathname = usePathname();
    const [opened, setOpened] = useState(false);
    const [anonId, setAnonId] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeChat, setActiveChat] = useState<LiveChat | null>(null);
    const activeChatRef = useRef<string | null>(null);
    const [messages, setMessages] = useState<LiveChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');

    const markAsSeenMutation = useMarkMessagesAsSeenMutation();
    const archiveMutation = useArchiveLiveChatMutation();

    // Sync ref
    useEffect(() => {
        activeChatRef.current = activeChat?._id || null;
    }, [activeChat]);

    // Mark as seen when opening widget
    useEffect(() => {
        if (opened && activeChat?._id) {
            markAsSeenMutation.mutate({ chatId: activeChat._id, isAdmin: false });
        }
    }, [opened, activeChat?._id]);

    const createChatMutation = useCreateLiveChatMutation();
    const sendMessageMutation = useSendLiveChatMessageAsUserMutation();

    const handleArchiveChat = async () => {
        if (!activeChat?._id) {
            setOpened(false);
            return;
        }

        modals.openConfirmModal({
            title: 'End Chat',
            children: (
                <Text size="sm">
                    Are you sure you want to end this chat? This will archive the conversation.
                </Text>
            ),
            labels: { confirm: 'End Chat', cancel: 'Continue Chat' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await archiveMutation.mutateAsync(activeChat._id);
                    setActiveChat(null);
                    setMessages([]);
                    setOpened(false);
                } catch (error) {
                    console.error("Failed to archive chat", error);
                }
            },
        });
    };

    // Fetch existing active chat by anon_id
    const { data: existingChat, isLoading: isLoadingChat } = useGetActiveLiveChatByAnonIdQuery(anonId);

    // Fetch messages for active chat
    const { data: existingMessages } = useGetLiveChatMessagesByAnonIdQuery(anonId);

    const viewport = useRef<HTMLDivElement>(null);

    // Initialize Anon ID
    useEffect(() => {
        let id = localStorage.getItem(ANON_ID_KEY);
        if (!id) {
            id = uuidv4();
            localStorage.setItem(ANON_ID_KEY, id);
        }
        setAnonId(id);
    }, []);

    // Set active chat from existing chat query
    useEffect(() => {
        if (existingChat && !activeChat) {
            setActiveChat(existingChat);
        }
    }, [existingChat, activeChat]);

    // Load messages when active chat changes or messages are fetched
    useEffect(() => {
        if (existingMessages && existingMessages.length > 0) {
            // To avoid clobbering optimistic messages, we only sync when the query data changes.
            // This prevents the "jump" when messages are refetched.
            setMessages(existingMessages);
            scrollToBottom();
        }
    }, [existingMessages]);


    // Initialize Socket
    useEffect(() => {
        if (!anonId) return;

        const newSocket = io(API_URL, {
            query: { anon_id: anonId },
            transports: ['websocket'],
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket with anon_id:', anonId);
        });

        newSocket.on('live_chat_message', (data: LiveChatMessage) => {
            console.log("New Message Received:", data);
            if (data?.sender_id) {
                setMessages((prev) => {
                    // Deduplicate: If it's the same content and sender as the last message, skip
                    const isDuplicate = prev.length > 0 &&
                        prev[prev.length - 1].message === data.message &&
                        prev[prev.length - 1].sender_id === data.sender_id;

                    if (isDuplicate) return prev;
                    return [...prev, data];
                });
                scrollToBottom();

                // If widget is open, mark as seen
                if (opened && activeChatRef.current) {
                    markAsSeenMutation.mutate({ chatId: activeChatRef.current, isAdmin: false });
                }
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [anonId]);

    const scrollToBottom = (force = false) => {
        if (viewport.current) {
            // Use requestAnimationFrame for smoother and more immediate scroll
            requestAnimationFrame(() => {
                if (viewport.current) {
                    viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'instant' });
                }
            });
        }
    };

    // Form for starting chat
    const form = useForm({
        initialValues: {
            subject: '',
            name: '',
            email: '',
        },
        validate: {
            subject: (value) => (value.length < 3 ? 'Subject is too short' : null),
            name: (value) => (value.length < 2 ? 'Name is too short' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    const handleStartChat = async (values: typeof form.values) => {
        if (!anonId) return;
        try {
            const chat = await createChatMutation.mutateAsync({
                ...values,
                anon_id: anonId,
                user_name: values.name,
                user_email: values.email,
                subject: values.subject
            });
            setActiveChat(chat);
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Could not start chat. Please try again.',
                color: 'red',
            });
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeChat || !anonId) return;

        const msg = messageInput;
        setMessageInput(''); // Reset input immediately

        // Optimistic UI update
        const optimisticMsg: LiveChatMessage = {
            message: msg,
            sender_id: anonId,
            chat_id: activeChat._id as any,
            seen: false,
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        scrollToBottom();

        try {
            await sendMessageMutation.mutateAsync({
                chat_id: activeChat._id,
                message: msg,
                sender_id: anonId
            });
        } catch (error) {
            console.error("Failed to send message", error);
            notifications.show({ title: 'Error', message: 'Failed to send message', color: 'red' });
            // Remove the optimistic message on error by filtering it out
            setMessages((prev) => prev.filter(m => m !== optimisticMsg));
        }
    };

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            <Transition transition="slide-up" mounted={opened}>
                {(styles) => (
                    <Paper
                        style={{ ...styles, zIndex: 9999, position: 'fixed', bottom: 100, right: 30, width: 350, height: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        shadow="xl"
                        radius="md"
                        withBorder
                    >
                        {/* Header */}
                        <Box style={{ background: 'linear-gradient(45deg, #EA4745 0%, #FF9200 100%)' }} p="md">
                            <Group justify="space-between">
                                <Group gap="xs">
                                    <ThemeIcon color="white" variant="transparent">
                                        <IconMessageCircle size={24} />
                                    </ThemeIcon>
                                    <Text c="white" fw={700}>Support Chat</Text>
                                </Group>
                                <ActionIcon variant="transparent" color="white" onClick={handleArchiveChat}>
                                    <IconX size={18} />
                                </ActionIcon>
                            </Group>
                            {activeChat && <Text c="white" size="xs" mt={5}>Ref: {activeChat.subject}</Text>}
                        </Box>

                        {/* Content */}
                        <Box style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {isLoadingChat ? (
                                <Stack p="md" align="center" justify="center" style={{ flex: 1 }}>
                                    <Loader size="sm" />
                                    <Text size="sm" c="dimmed">Loading chat...</Text>
                                </Stack>
                            ) : !activeChat ? (
                                <Stack p="md" style={{ overflowY: 'auto' }}>
                                    <Text size="sm" c="dimmed">
                                        Please fill out the form below to start chatting with our support team.
                                    </Text>
                                    <form onSubmit={form.onSubmit(handleStartChat)}>
                                        <Stack>
                                            <TextInput size='sm' required label="Name" placeholder="Your name" {...form.getInputProps('name')} />
                                            <TextInput size='sm' required label="Email" placeholder="your@email.com" {...form.getInputProps('email')} />
                                            <TextInput size='sm' required label="Subject" placeholder="How can we help?" {...form.getInputProps('subject')} />
                                            <Button type="submit" loading={createChatMutation.isPending} fullWidth mt="md" variant="gradient" gradient={{ from: "#EA4745", to: "#FF9200" }}>Start Chat</Button>
                                        </Stack>
                                    </form>
                                </Stack>
                            ) : (
                                <>
                                    <ScrollArea p="md" style={{ flex: 1 }} viewportRef={viewport}>
                                        <Stack gap="xs">
                                            {messages.length === 0 && (
                                                <Text c="dimmed" size="xs" ta="center" mt="xl">No messages yet. Start typing...</Text>
                                            )}
                                            {messages.map((msg, index) => {
                                                const isMe = msg.sender_id === anonId;
                                                return (
                                                    <Group key={index} justify={isMe ? 'flex-end' : 'flex-start'} align="flex-start" gap="xs">
                                                        {!isMe && <Avatar size="sm" radius="xl" color="blue"><IconUser size={14} /></Avatar>}
                                                        <Paper p="xs" radius="md" bg={isMe ? '#EA4745' : 'gray.1'} style={{ maxWidth: '80%', color: isMe ? 'white' : 'black' }}>
                                                            <Text size="sm" c={isMe ? 'white' : 'black'}>{msg.message}</Text>
                                                        </Paper>
                                                    </Group>
                                                )
                                            })}
                                        </Stack>
                                    </ScrollArea>

                                    {/* Input Area */}
                                    <Box p="xs" bg="gray.0" style={{ borderTop: '1px solid #eee' }}>
                                        <Group gap={5}>
                                            <Textarea
                                                placeholder="Type a message..."
                                                autosize
                                                minRows={1}
                                                maxRows={3}
                                                style={{ flex: 1 }}
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                            />
                                            <ActionIcon variant="gradient" gradient={{ from: "#EA4745", to: "#FF9200" }} size="lg" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                                                <IconSend size={18} />
                                            </ActionIcon>
                                        </Group>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Paper>
                )}
            </Transition>

            <ActionIcon
                variant="gradient"
                gradient={{ from: "#EA4745", to: "#FF9200" }}
                size={60}
                radius={60}
                style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                onClick={() => setOpened((o) => !o)}
            >
                {opened ? <IconChevronDown size={30} /> : <IconBrandMessenger size={30} />}
            </ActionIcon>
        </>
    );
}
