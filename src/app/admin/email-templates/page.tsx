"use client";

import React, { useEffect, useState } from "react";
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  TextInput,
  Textarea,
  Button,
  Badge,
  Box,
  SimpleGrid,
  ScrollArea,
  UnstyledButton,
  Divider,
  Modal,
  CopyButton,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconCheck,
  IconCopy,
  IconRotateClockwise,
  IconDeviceFloppy,
  IconTrash,
  IconPlus,
  IconArrowUp,
  IconArrowDown,
  IconEye,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import http from "@/hooks/Http";

type BlockType = "paragraph" | "heading" | "list";

interface EmailBlock {
  type: BlockType;
  text?: string;
  items?: string[];
}

interface EmailTemplateSummary {
  key: string;
  name: string;
  description: string;
  variables: string[];
  subject: string;
  blocks: EmailBlock[];
  isCustomized: boolean;
}

const BLOCK_TYPE_LABEL: Record<BlockType, string> = {
  paragraph: "Paragraph",
  heading: "Section Heading",
  list: "Bulleted List",
};

const useEmailTemplatesQuery = () =>
  useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const res = await http.instance.get<EmailTemplateSummary[]>("/email-template");
      return res.data;
    },
  });

const useUpdateEmailTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
      subject,
      blocks,
    }: {
      key: string;
      subject: string;
      blocks: EmailBlock[];
    }) => {
      const res = await http.instance.patch<EmailTemplateSummary>(`/email-template/${key}`, {
        subject,
        blocks,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      notifications.show({
        title: "Template Saved",
        message: "The email template has been updated.",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Save Failed",
        message: "Could not save the email template. Please try again.",
        color: "red",
      });
    },
  });
};

const useResetEmailTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      const res = await http.instance.post<EmailTemplateSummary>(`/email-template/${key}/reset`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      notifications.show({
        title: "Reverted to Default",
        message: "The email template has been reset to its built-in default.",
        color: "blue",
      });
    },
  });
};

const usePreviewMutation = () =>
  useMutation({
    mutationFn: async ({
      key,
      subject,
      blocks,
    }: {
      key: string;
      subject: string;
      blocks: EmailBlock[];
    }) => {
      const res = await http.instance.post<{ subject: string; html: string }>(
        `/email-template/${key}/preview`,
        { subject, blocks }
      );
      return res.data;
    },
  });

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  block: EmailBlock;
  index: number;
  total: number;
  onChange: (block: EmailBlock) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <Card withBorder padding="sm" radius="md">
      <Stack gap={8}>
        <Group justify="space-between">
          <Badge variant="light" color="gray">
            {BLOCK_TYPE_LABEL[block.type]}
          </Badge>
          <Group gap={4}>
            <Tooltip label="Move up">
              <ActionIcon
                variant="subtle"
                size="sm"
                disabled={index === 0}
                onClick={() => onMove(-1)}
              >
                <IconArrowUp size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Move down">
              <ActionIcon
                variant="subtle"
                size="sm"
                disabled={index === total - 1}
                onClick={() => onMove(1)}
              >
                <IconArrowDown size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Remove">
              <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemove}>
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {block.type === "list" ? (
          <Stack gap={6}>
            {(block.items || []).map((item, i) => (
              <Group key={i} gap={6} wrap="nowrap">
                <TextInput
                  style={{ flex: 1 }}
                  placeholder={`Bullet point ${i + 1}`}
                  value={item}
                  onChange={(e) => {
                    const items = [...(block.items || [])];
                    items[i] = e.currentTarget.value;
                    onChange({ ...block, items });
                  }}
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => {
                    const items = (block.items || []).filter((_, idx) => idx !== i);
                    onChange({ ...block, items });
                  }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={() => onChange({ ...block, items: [...(block.items || []), ""] })}
            >
              Add bullet point
            </Button>
          </Stack>
        ) : block.type === "heading" ? (
          <TextInput
            placeholder="Section heading text"
            value={block.text || ""}
            onChange={(e) => onChange({ ...block, text: e.currentTarget.value })}
          />
        ) : (
          <Textarea
            placeholder="Paragraph text"
            value={block.text || ""}
            onChange={(e) => onChange({ ...block, text: e.currentTarget.value })}
            autosize
            minRows={2}
          />
        )}
      </Stack>
    </Card>
  );
}

export default function EmailTemplatesPage() {
  const { data: templates, isLoading } = useEmailTemplatesQuery();
  const updateMutation = useUpdateEmailTemplateMutation();
  const resetMutation = useResetEmailTemplateMutation();
  const previewMutation = usePreviewMutation();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [previewOpened, setPreviewOpened] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);

  const selected = templates?.find((t) => t.key === selectedKey) || null;

  useEffect(() => {
    if (templates && templates.length > 0 && !selectedKey) {
      setSelectedKey(templates[0].key);
    }
  }, [templates, selectedKey]);

  useEffect(() => {
    if (selected) {
      setSubject(selected.subject);
      setBlocks(selected.blocks.map((b) => ({ ...b, items: b.items ? [...b.items] : undefined })));
      setPreview(null);
    }
  }, [selected?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasChanges = selected
    ? subject !== selected.subject || JSON.stringify(blocks) !== JSON.stringify(selected.blocks)
    : false;

  const handleSave = () => {
    if (!selected) return;
    updateMutation.mutate({ key: selected.key, subject, blocks });
  };

  const handlePreview = () => {
    if (!selected) return;
    setPreviewOpened(true);
    previewMutation.mutate(
      { key: selected.key, subject, blocks },
      { onSuccess: (data) => setPreview(data) }
    );
  };

  const handleReset = () => {
    if (!selected) return;
    resetMutation.mutate(selected.key);
  };

  const updateBlock = (index: number, next: EmailBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? next : b)));
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addBlock = (type: BlockType) => {
    setBlocks((prev) => [
      ...prev,
      type === "list" ? { type, items: [""] } : { type, text: "" },
    ]);
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Box>
        <Title order={2}>Email Templates</Title>
        <Text c="dimmed" size="sm">
          Edit exactly what customers receive — just fill in the text fields below, no
          code or HTML required. Use the variable chips to insert dynamic values like the
          customer&apos;s name; they&apos;re filled in automatically when the email is sent.
        </Text>
      </Box>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Card withBorder padding="sm">
          <Stack gap={4}>
            {(templates || []).map((t) => (
              <UnstyledButton
                key={t.key}
                onClick={() => setSelectedKey(t.key)}
                p="xs"
                style={{
                  borderRadius: 6,
                  backgroundColor: t.key === selectedKey ? "var(--mantine-color-blue-0)" : undefined,
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Text size="sm" fw={600} truncate>
                    {t.name}
                  </Text>
                  {t.isCustomized && (
                    <Badge size="xs" color="orange" variant="light">
                      Customized
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="dimmed" lineClamp={2}>
                  {t.description}
                </Text>
              </UnstyledButton>
            ))}
          </Stack>
        </Card>

        {selected && (
          <Box style={{ gridColumn: "span 2" }}>
            <Card withBorder padding="lg">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Box>
                    <Text fw={700}>{selected.name}</Text>
                    <Text size="xs" c="dimmed">
                      {selected.description}
                    </Text>
                  </Box>
                  <Group gap="xs">
                    {selected.isCustomized && (
                      <Button
                        variant="light"
                        color="gray"
                        size="xs"
                        leftSection={<IconRotateClockwise size={14} />}
                        onClick={handleReset}
                        loading={resetMutation.isPending}
                      >
                        Reset to Default
                      </Button>
                    )}
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconEye size={14} />}
                      onClick={handlePreview}
                      loading={previewMutation.isPending}
                    >
                      Preview Letter
                    </Button>
                    <Button
                      size="xs"
                      leftSection={<IconDeviceFloppy size={14} />}
                      onClick={handleSave}
                      disabled={!hasChanges}
                      loading={updateMutation.isPending}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Group>

                <Divider />

                <Box>
                  <Text size="xs" fw={600} mb={4} c="dimmed">
                    AVAILABLE VARIABLES — click to copy, then paste into any field below
                  </Text>
                  <Group gap={6}>
                    {selected.variables.map((v) => (
                      <CopyButton key={v} value={`{{${v}}}`}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? "Copied!" : `Copy {{${v}}}`}>
                            <Badge
                              variant="outline"
                              color={copied ? "green" : "blue"}
                              style={{ cursor: "pointer" }}
                              onClick={copy}
                              rightSection={
                                copied ? <IconCheck size={10} /> : <IconCopy size={10} />
                              }
                            >
                              {`{{${v}}}`}
                            </Badge>
                          </Tooltip>
                        )}
                      </CopyButton>
                    ))}
                  </Group>
                </Box>

                <TextInput
                  label="Subject Line"
                  description="What the customer sees in their inbox"
                  value={subject}
                  onChange={(e) => setSubject(e.currentTarget.value)}
                />

                <Stack gap="sm">
                  <Text size="xs" fw={600} c="dimmed">
                    EMAIL BODY — edit each section below. Wrap text in ** ** to make it
                    bold (e.g. **Quote Amount**).
                  </Text>
                  {blocks.map((block, i) => (
                    <BlockEditor
                      key={i}
                      block={block}
                      index={i}
                      total={blocks.length}
                      onChange={(next) => updateBlock(i, next)}
                      onRemove={() => removeBlock(i)}
                      onMove={(dir) => moveBlock(i, dir)}
                    />
                  ))}
                  <Group gap={8}>
                    <Text size="xs" c="dimmed">
                      Add:
                    </Text>
                    <Button size="xs" variant="light" onClick={() => addBlock("paragraph")}>
                      + Paragraph
                    </Button>
                    <Button size="xs" variant="light" onClick={() => addBlock("heading")}>
                      + Heading
                    </Button>
                    <Button size="xs" variant="light" onClick={() => addBlock("list")}>
                      + Bulleted List
                    </Button>
                  </Group>
                </Stack>
              </Stack>
            </Card>
          </Box>
        )}
      </SimpleGrid>

      <Modal
        opened={previewOpened}
        onClose={() => setPreviewOpened(false)}
        title="Letter Preview"
        size="lg"
      >
        <Box
          style={{
            border: "1px solid var(--mantine-color-gray-3)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {previewMutation.isPending ? (
            <Center h={200}>
              <Loader size="sm" />
            </Center>
          ) : preview ? (
            <>
              <Box p="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
                <Text size="xs" c="dimmed">
                  Subject
                </Text>
                <Text fw={600}>{preview.subject}</Text>
              </Box>
              <ScrollArea h={450}>
                <iframe
                  title="Email preview"
                  srcDoc={preview.html}
                  style={{ width: "100%", height: 450, border: "none" }}
                />
              </ScrollArea>
            </>
          ) : (
            <Center h={200}>
              <Text size="sm" c="dimmed">
                Preview unavailable.
              </Text>
            </Center>
          )}
        </Box>
      </Modal>
    </Stack>
  );
}
