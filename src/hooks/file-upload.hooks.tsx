"use client";

import { useMutation } from "@tanstack/react-query";
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

export const useUploadFileMutation = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const res = await http.fileUpload.fileUploadControllerUploadFile({
        file,
      });
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "File uploaded successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Upload Failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};
