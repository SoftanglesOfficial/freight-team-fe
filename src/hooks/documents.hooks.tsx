"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateDocumentDto, DocumentCategory, UpdateDocumentDto } from "./Api";
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

export const useCreateDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentDto) => {
      const res = await http.document.documentControllerCreate(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      notifications.show({
        title: "Document created",
        message: "The document has been created successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Document creation failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useGetDocumentsQuery = (
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    shipment_id?: string;
    quote_request_id?: string;
    sortBy?: "createdAt" | "updatedAt" | "name" | "size";
    sortOrder?: "asc" | "desc";
    category: DocumentCategory;
    customer_id?: string;
  } = { category: DocumentCategory.BOL },
) => {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  return useQuery({
    queryKey: ["documents", queryParams],
    queryFn: async () => {
      const res = await http.document.documentControllerFindAll(queryParams);
      return res.data;
    },
  });
};

export const useGetDocumentQuery = (id: string) => {
  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const res = await http.document.documentControllerFindOne(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useUpdateDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDocumentDto;
    }) => {
      const res = await http.document.documentControllerUpdate(id, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] });
      notifications.show({
        title: "Document updated",
        message: "The document has been updated successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Document update failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useDeleteDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await http.document.documentControllerRemove(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents-shipment"] });
      queryClient.invalidateQueries({ queryKey: ["documents-quote-request"] });
      notifications.show({
        title: "Document deleted",
        message: "The document has been deleted successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Document deletion failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useGetDocumentsByShipmentIdQuery = (shipmentId: string) => {
  return useQuery({
    queryKey: ["documents-shipment", shipmentId],
    queryFn: async () => {
      const res =
        await http.document.documentControllerFindByShipmentId(shipmentId);
      return res.data;
    },
    enabled: !!shipmentId,
  });
};

export const useGetDocumentsByQuoteRequestIdQuery = (
  quoteRequestId: string,
) => {
  return useQuery({
    queryKey: ["documents-quote-request", quoteRequestId],
    queryFn: async () => {
      const res =
        await http.document.documentControllerFindByQuoteRequestId(
          quoteRequestId,
        );
      return res.data;
    },
    enabled: !!quoteRequestId,
  });
};
