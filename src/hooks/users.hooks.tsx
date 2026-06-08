import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import http from "./Http";
import { MakeUserPasswordDto, Role, UpdateUserDto } from "./Api";
import { notifications } from "@mantine/notifications";

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

export const useGetUsersQuery = (params: {
  page: number;
  pageSize: number;
  is_active?: boolean;
  search?: string;
  role?: Role;
}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const res = await http.user.userControllerIndex(params);
      return res.data;
    },
  });
};

export const useGetUserQuery = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await http.user.userControllerFindOne(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
      const res = await http.user.userControllerUpdate(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({
        title: "Success",
        message: "User updated successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useMakeUserPasswordMutation = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: MakeUserPasswordDto;
    }) => {
      const res = await http.user.userControllerMakePassword(id, data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Password changed successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export interface CreateCustomerPayload {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  company_name?: string;
}

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCustomerPayload) => {
      const res = await http.instance.post("/user/create-customer", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({
        title: "Customer Created",
        message:
          "Customer account created successfully. Login credentials have been sent to their email.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await http.user.userControllerRemove(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({
        title: "Success",
        message: "User deleted successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};
