import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import http from "./Http";
import { UpdateNotificationDto } from "./Api";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params: { page: number; pageSize: number; seen?: number }) =>
    ["notifications", params] as const,
  unseen: ["notifications", "unseen"] as const,
};

export const useNotificationsQuery = (params: {
  page: number;
  pageSize: number;
  seen?: number;
}) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const res = await http.notification.notificationControllerIndex(params);
      return res.data;
    },
  });
};

export const useUnseenNotificationsQuery = () => {
  return useQuery({
    queryKey: notificationKeys.unseen,
    queryFn: async () => {
      const res = await http.notification.notificationControllerIndex({
        page: 1,
        pageSize: 20,
        seen: 0,
      });
      return res.data;
    },
  });
};

export const useMarkNotificationSeenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateNotificationDto;
    }) => {
      const res = await http.notification.notificationControllerUpdateOne(
        id,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res =
        await http.notification.notificationControllerRemoveOne(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
