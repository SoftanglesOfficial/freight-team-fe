"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateShipmentDto,
  UpdateShipmentDto,
  TrackingResponseDto,
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

export const useTrackShipmentQuery = (proNumber: string) => {
  return useQuery<TrackingResponseDto>({
    queryKey: ["shipment-track", proNumber],
    queryFn: async () => {
      const res = await http.shipment.shipmentControllerTrack(proNumber);
      return res.data;
    },
    enabled: !!proNumber,
  });
};

export const useCreateShipmentMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateShipmentDto) => {
      const res = await http.shipment.shipmentControllerCreate(data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Shipment created",
        message: "The shipment has been created successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Shipment creation failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useGetShipmentsQuery = (
  params: {
    page?: number;
    pageSize?: number;
    proNumber?: string;
    carrierName?: string;
    customer_name?: string;
    customer_email?: string;
    dateOfOrder_from?: string;
    dateOfOrder_to?: string;
    pickupDate_from?: string;
    pickupDate_to?: string;
    estimatedDeliveryDate_from?: string;
    estimatedDeliveryDate_to?: string;
    deliveryDate_from?: string;
    deliveryDate_to?: string;
    quoteId?: string;
    status?: string;
    customer_id?: string;
  } = {}
) => {
  const queryParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...params,
  };

  return useQuery({
    queryKey: ["shipments", queryParams],
    queryFn: async () => {
      const res = await http.shipment.shipmentControllerFindAll(queryParams);
      return res.data;
    },
  });
};

export const useGetShipmentQuery = (id: string) => {
  return useQuery({
    queryKey: ["shipment", id],
    queryFn: async () => {
      const res = await http.shipment.shipmentControllerFindOne(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useGetShipmentByProNumberQuery = (proNumber: string) => {
  return useQuery({
    queryKey: ["shipment-pro", proNumber],
    queryFn: async () => {
      const res = await http.shipment.shipmentControllerFindByFtlId(proNumber);
      return res.data;
    },
    enabled: !!proNumber,
  });
};

export const useUpdateShipmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateShipmentDto;
    }) => {
      const res = await http.shipment.shipmentControllerUpdate(id, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch shipments queries
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      // Also invalidate the specific shipment query
      queryClient.invalidateQueries({ queryKey: ["shipment", variables.id] });

      notifications.show({
        title: "Shipment updated",
        message: "The shipment has been updated successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Shipment update failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useDeleteShipmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await http.shipment.shipmentControllerRemove(id);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch shipments queries
      queryClient.invalidateQueries({ queryKey: ["shipments"] });

      notifications.show({
        title: "Shipment deleted",
        message: "The shipment has been deleted successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Shipment deletion failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useUpdateShipmentLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      latitude,
      longitude,
      note,
    }: {
      id: string;
      latitude: number;
      longitude: number;
      note?: string;
    }) => {
      const res = await http.shipment.shipmentControllerUpdateLocation(id, {
        latitude,
        longitude,
        note,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch shipment queries
      queryClient.invalidateQueries({ queryKey: ["shipment", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });

      notifications.show({
        title: "Location updated",
        message: "The shipment location has been updated successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Location update failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useAddShipmentNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const res = await http.shipment.shipmentControllerAddNote(id, { note });
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch shipment queries
      queryClient.invalidateQueries({ queryKey: ["shipment", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["shipments"] });

      notifications.show({
        title: "Note added",
        message: "The note has been added to the shipment history.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Failed to add note",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};