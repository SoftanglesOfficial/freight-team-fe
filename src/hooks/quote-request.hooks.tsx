"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateQuoteRequestDto,
  UpdateQuoteRequestDto,
  QuoteRequestStatus,
  QuoteRequest,
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

export const useCreateQuoteRequestMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateQuoteRequestDto) => {
      const res = await http.quoteRequest.quoteRequestControllerCreate(data);
      return res.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: "Quote request submitted",
        message: `Your quote request has been submitted successfully. Tracking ID: ${data.tracking_id}`,
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Submission failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useGetQuoteRequestsQuery = (
  params: {
    page?: number;
    pageSize?: number;
    full_name?: string;
    email?: string;
    tracking_id?: string;
    status?: QuoteRequestStatus;
    customer_id?: string;
  } = {}
) => {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  return useQuery({
    queryKey: ["quote-requests", queryParams],
    queryFn: async () => {
      const res = await http.quoteRequest.quoteRequestControllerFindAll(
        queryParams
      );
      return res.data;
    },
  });
};

export const useGetQuoteRequestQuery = (id: string) => {
  return useQuery<QuoteRequest>({
    queryKey: ["quote-request", id],
    queryFn: async () => {
      const res = await http.quoteRequest.quoteRequestControllerFindOne(id);
      return res.data as QuoteRequest;
    },
    enabled: !!id,
  });
};

export const useTrackQuoteRequestQuery = (trackingId: string) => {
  return useQuery({
    queryKey: ["quote-request-tracking", trackingId],
    queryFn: async () => {
      const res = await http.quoteRequest.quoteRequestControllerTrack(
        trackingId
      );
      return res.data;
    },
    enabled: !!trackingId,
  });
};

export const useUpdateQuoteRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateQuoteRequestDto;
    }) => {
      const res = await http.quoteRequest.quoteRequestControllerUpdate(
        id,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch quote requests queries
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] });

      notifications.show({
        title: "Quote request updated",
        message: "The quote request has been updated successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Update failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useDeleteQuoteRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await http.quoteRequest.quoteRequestControllerRemove(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] });
      notifications.show({
        title: "Quote request deleted",
        message: "The quote request has been deleted successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Deletion failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export interface SendQuoteEmailPayload {
  quoteAmount: number;
  carrier: string;
  estimatedTransitDays: number;
  notes?: string;
}

export const useSendQuoteEmailMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SendQuoteEmailPayload }) => {
      const res = await http.instance.post(`/quote-request/${id}/send-email`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] });
      notifications.show({
        title: "Quote Email Sent",
        message: "The quote has been emailed to the customer successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Email Failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

