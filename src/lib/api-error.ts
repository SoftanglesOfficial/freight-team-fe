type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  errors?: Record<string, string>;
  statusCode?: number;
};

const FIELD_LABELS: Record<string, string> = {
  proNumber: "PRO number",
  poNumber: "PO number",
  ftlWareHouseId: "FTL Warehouse ID",
  carrierName: "Carrier name",
  dateOfOrder: "Date of order",
  estimatedDeliveryDate: "Estimated delivery date",
  "customer.email": "Customer email",
  "customer.name": "Customer name",
  "origin_address.zip_code": "Origin zip code",
  "destination_address.zip_code": "Destination zip code",
  documents: "BOL document",
};

function humanizeField(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

export function extractApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error) return fallback;

  const apiError = error as {
    response?: { data?: ApiErrorBody; status?: number };
    message?: string;
  };

  const data = apiError.response?.data;
  if (!data) {
    return apiError.message || fallback;
  }

  if (data.errors && typeof data.errors === "object") {
    const lines = Object.entries(data.errors).map(
      ([field, msg]) => `${humanizeField(field)}: ${msg}`,
    );
    if (lines.length) return lines.join("\n");
  }

  if (Array.isArray(data.message)) {
    const lines = data.message.map((entry) => {
      const match = entry.match(/^([^\s]+)\s+(.+)$/);
      if (match) {
        return `${humanizeField(match[1])}: ${match[2].split(",")[0].trim()}`;
      }
      return entry;
    });
    return lines.join("\n");
  }

  if (typeof data.message === "string" && data.message.trim()) {
    if (
      data.message === "Internal server error" &&
      apiError.response?.status === 500
    ) {
      return "The server could not create this shipment. Please verify all required fields (customer, addresses, carrier, dates, BOL) and try again.";
    }
    return data.message;
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return fallback;
}
