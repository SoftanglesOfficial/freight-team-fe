"use client";

import React, { useState } from "react";
import {
  Title,
  Box,
  Group,
  TextInput,
  SegmentedControl,
  Card,
  Avatar,
  Text,
  Stack,
  ScrollArea,
  Textarea,
  ActionIcon,
  Badge,
} from "@mantine/core";
import {
  IconSearch,
  IconPaperclip,
  IconSend,
  IconMessage,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useCreateChatMessageMutation,
  useGetPublicChatRoomsQuery,
  useGetPublicChatMessagesQuery,
  useSendPublicChatMessageMutation,
} from "@/hooks/chat.hooks";
import type { Chat, ChatMessage, User } from "@/hooks/Api";
import { ChatMessageType } from "@/hooks/Api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type ChatTypeFilter = "public" | "customer";

interface ConversationInfo {
  name: string;
  company: string;
  initials: string;
}

// Helper function to get initials from name
const getInitials = (firstName: string, lastName?: string) => {
  const first = firstName?.[0]?.toUpperCase() || "";
  const last = lastName?.[0]?.toUpperCase() || "";
  return `${first}${last}` || "U";
};

// Helper function to format time ago
const formatTimeAgo = (date: string) => {
  try {
    return dayjs(date).fromNow();
  } catch {
    return "";
  }
};

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [chatType, setChatType] = useState<ChatTypeFilter>("customer");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  // Fetch customer chats
  const { data: customerChatsData, isLoading: isLoadingCustomerChats } =
    useGetChatsQuery({
      page: 1,
      pageSize: 100,
    });

  // Fetch public chat rooms
  const { data: publicChatRooms, isLoading: isLoadingPublicChats } =
    useGetPublicChatRoomsQuery();

  // Fetch messages for selected chat
  const { data: chatMessagesData, refetch: refetchMessages } =
    useGetChatMessagesQuery(selectedChatId || "", {
      page: 1,
      pageSize: 100,
    });

  // Fetch public chat messages
  const { data: publicChatMessagesData, refetch: refetchPublicMessages } =
    useGetPublicChatMessagesQuery(selectedChatId || "", {
      limit: 100,
    });

  // Mutations
  const createMessageMutation = useCreateChatMessageMutation();
  const sendPublicMessageMutation = useSendPublicChatMessageMutation();

  // Get chats based on type (public chat rooms may be Chat[] or different type)
  const chats: Chat[] =
    chatType === "customer"
      ? customerChatsData?.records || []
      : Array.isArray(publicChatRooms)
      ? publicChatRooms
      : [];

  const isLoading =
    chatType === "customer" ? isLoadingCustomerChats : isLoadingPublicChats;

  // Filter chats based on search
  const filteredChats = chats.filter((chat: Chat) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    if (chatType === "customer") {
      const otherMember = chat.members?.find((m: User) => m._id !== user?._id);
      const name = otherMember
        ? `${otherMember.first_name} ${otherMember.last_name || ""}`.trim()
        : chat.name || "";
      return name.toLowerCase().includes(searchLower);
    } else {
      return (
        chat.name?.toLowerCase().includes(searchLower) ||
        chat.public_room_name?.toLowerCase().includes(searchLower)
      );
    }
  });

  // Get selected chat details
  const selectedChat = chats.find((chat: Chat) => chat._id === selectedChatId);

  // Get messages based on type
  const messages: ChatMessage[] =
    chatType === "customer"
      ? chatMessagesData?.records || []
      : Array.isArray(publicChatMessagesData)
      ? publicChatMessagesData
      : [];

  // Get conversation name and avatar
  const getConversationInfo = (chat: Chat): ConversationInfo => {
    if (chatType === "customer") {
      const otherMember = chat.members?.find((m: User) => m._id !== user?._id);
      if (otherMember) {
        return {
          name: `${otherMember.first_name} ${
            otherMember.last_name || ""
          }`.trim(),
          company: otherMember.email?.split("@")[1] || "",
          initials: getInitials(otherMember.first_name, otherMember.last_name),
        };
      }
      return {
        name: chat.name || "Unknown",
        company: "",
        initials: "U",
      };
    } else {
      return {
        name: chat.name || chat.public_room_name || "Public Chat",
        company: "",
        initials: chat.name?.[0]?.toUpperCase() || "P",
      };
    }
  };

  // Get unread count (dummy for now - would need to implement based on API)
  const getUnreadCount = () => {
    // TODO: Implement based on unread messages API
    return 0;
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChatId) return;

    try {
      if (chatType === "customer") {
        await createMessageMutation.mutateAsync({
          chatId: selectedChatId,
          data: { content: messageText, type: ChatMessageType.Text },
        });
      } else {
        await sendPublicMessageMutation.mutateAsync({
          chatId: selectedChatId,
          data: { content: messageText },
        });
      }
      setMessageText("");
      refetchMessages();
      refetchPublicMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Get last message preview
  const getLastMessagePreview = (chat: Chat) => {
    if (chat.last_message) {
      return chat.last_message.content || "No messages";
    }
    return "No messages";
  };

  const selectedChatInfo = selectedChat
    ? getConversationInfo(selectedChat)
    : null;

  return (
    <Box>
      {/* Title */}
      <Title order={1} c="gray.8" mb="xl" style={{ margin: 0 }}>
        Messages
      </Title>

      {/* Search and Chat Type Selector */}
      <Group mb="xl" gap="md">
        <TextInput
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <SegmentedControl
          value={chatType}
          onChange={(value) => {
            setChatType(value as ChatTypeFilter);
            setSelectedChatId(null);
          }}
          data={[
            { label: "Customer", value: "customer" },
            { label: "Public", value: "public" },
          ]}
        />
      </Group>

      {/* Main Content Area - Two Panel Layout */}
      <Card shadow="sm" padding={0} withBorder>
        <Group gap={0} align="stretch" style={{ minHeight: "600px" }}>
          {/* Left Panel - Conversation List */}
          <Box
            style={{
              width: "350px",
              borderRight: "1px solid #e9ecef",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ScrollArea style={{ flex: 1 }}>
              <Stack gap={0}>
                {isLoading ? (
                  <Box p="md">
                    <Text c="dimmed">Loading conversations...</Text>
                  </Box>
                ) : filteredChats.length === 0 ? (
                  <Box p="md">
                    <Text c="dimmed">No conversations found</Text>
                  </Box>
                ) : (
                  filteredChats.map((chat: Chat) => {
                    const info = getConversationInfo(chat);
                    const unreadCount = getUnreadCount();
                    const lastMessage = getLastMessagePreview(chat);
                    const lastMessageTime = chat.last_message_at
                      ? formatTimeAgo(chat.last_message_at)
                      : "";

                    return (
                      <Box
                        key={chat._id}
                        onClick={() => setSelectedChatId(chat._id)}
                        style={{
                          padding: "1rem",
                          cursor: "pointer",
                          backgroundColor:
                            selectedChatId === chat._id
                              ? "#f8f9fa"
                              : "transparent",
                          borderBottom: "1px solid #e9ecef",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}
                        onMouseEnter={(e) => {
                          if (selectedChatId !== chat._id) {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedChatId !== chat._id) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }
                        }}
                      >
                        <Group gap="sm" wrap="nowrap">
                          <Avatar
                            size="md"
                            radius="xl"
                            color={
                              chat._id === selectedChatId ? "teal" : "orange"
                            }
                          >
                            {info.initials}
                          </Avatar>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Group
                              justify="space-between"
                              gap="xs"
                              wrap="nowrap"
                            >
                              <Text fw={500} size="sm" truncate>
                                {info.name}
                              </Text>
                              {lastMessageTime && (
                                <Text size="xs" c="dimmed">
                                  {lastMessageTime}
                                </Text>
                              )}
                            </Group>
                            <Group justify="space-between" gap="xs" mt={4}>
                              <Text
                                size="xs"
                                c="dimmed"
                                truncate
                                style={{ flex: 1 }}
                              >
                                {lastMessage}
                              </Text>
                              {unreadCount > 0 && (
                                <Badge
                                  size="sm"
                                  variant="filled"
                                  color="red"
                                  radius="xl"
                                  style={{ minWidth: "20px" }}
                                >
                                  {unreadCount}
                                </Badge>
                              )}
                            </Group>
                          </Box>
                        </Group>
                      </Box>
                    );
                  })
                )}
              </Stack>
            </ScrollArea>
          </Box>

          {/* Right Panel - Chat Window */}
          <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {selectedChatId && selectedChatInfo ? (
              <>
                {/* Chat Header */}
                <Box
                  p="md"
                  style={{
                    borderBottom: "1px solid #e9ecef",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <Group gap="sm">
                    <Avatar size="md" radius="xl" color="teal">
                      {selectedChatInfo.initials}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                      <Text fw={500} size="sm">
                        {selectedChatInfo.name}
                        {selectedChatInfo.company &&
                          ` - ${selectedChatInfo.company}`}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Active Now
                      </Text>
                    </Box>
                  </Group>
                </Box>

                {/* Messages Area */}
                <ScrollArea style={{ flex: 1, padding: "1rem" }}>
                  <Stack gap="md">
                    {messages.length === 0 ? (
                      <Box style={{ textAlign: "center", padding: "2rem" }}>
                        <IconMessage size={48} color="#ced4da" />
                        <Text c="dimmed" mt="md">
                          No messages yet. Start the conversation!
                        </Text>
                      </Box>
                    ) : (
                      messages.map((message: ChatMessage) => {
                        const isCurrentUser = message.sender?._id === user?._id;
                        const messageTime = formatTimeAgo(message.createdAt);

                        return (
                          <Box
                            key={message._id}
                            style={{
                              display: "flex",
                              justifyContent: isCurrentUser
                                ? "flex-end"
                                : "flex-start",
                            }}
                          >
                            <Box
                              style={{
                                maxWidth: "70%",
                                padding: "0.75rem 1rem",
                                borderRadius: "1rem",
                                backgroundColor: isCurrentUser
                                  ? "#ff6b6b"
                                  : "#e9ecef",
                                color: isCurrentUser ? "white" : "black",
                              }}
                            >
                              <Text
                                size="sm"
                                style={{ wordBreak: "break-word" }}
                              >
                                {message.content}
                              </Text>
                              <Text
                                size="xs"
                                mt={4}
                                style={{
                                  opacity: 0.7,
                                  textAlign: "right",
                                }}
                              >
                                {messageTime}
                              </Text>
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </Stack>
                </ScrollArea>

                {/* Message Input Area */}
                <Box
                  p="md"
                  style={{
                    borderTop: "1px solid #e9ecef",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <Group gap="sm" align="flex-end">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="lg"
                      radius="xl"
                    >
                      <IconPaperclip size={20} />
                    </ActionIcon>
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      style={{ flex: 1 }}
                      autosize
                      minRows={1}
                      maxRows={4}
                    />
                    <ActionIcon
                      variant="filled"
                      color="red"
                      size="lg"
                      radius="xl"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      <IconSend size={20} />
                    </ActionIcon>
                  </Group>
                </Box>
              </>
            ) : (
              <Box
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stack align="center" gap="md">
                  <IconMessage size={64} color="#ced4da" />
                  <Text c="dimmed" size="lg">
                    Select a conversation to start messaging
                  </Text>
                </Stack>
              </Box>
            )}
          </Box>
        </Group>
      </Card>
    </Box>
  );
}
