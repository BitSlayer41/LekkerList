export const ORDER_STATUS_FLOW = ["paid", "processing", "shipped", "delivered"];

export const NEXT_STATUS_MAP = {
  paid: "processing",
  processing: "shipped",
  shipped: "delivered",
  delivered: null,
};

// labels for UI
export const STATUS_LABELS = {
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};
