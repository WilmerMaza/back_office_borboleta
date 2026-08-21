import { RevenueChart, StatisticsCount } from "../interface/dashboard.interface";

/** Respuestas típicas del API Node / Express */
function unwrapPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const o = raw as Record<string, unknown>;
  const inner = o["data"];
  if (inner !== undefined && inner !== null && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return o;
}

function extractStatisticsSource(raw: unknown): Record<string, unknown> {
  let body = unwrapPayload(raw);
  const nested = body["statistics"];
  if (nested !== undefined && nested !== null && typeof nested === "object" && !Array.isArray(nested)) {
    body = nested as Record<string, unknown>;
  }
  return body;
}

function pickNumber(body: Record<string, unknown>, camel: string, snake: string): number {
  const candidates = [body[camel], body[snake]];
  for (const v of candidates) {
    if (v !== undefined && v !== null && v !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        return n;
      }
    }
  }
  return 0;
}

/** Une camelCase (API Node) y snake_case (plantilla Fastkart) */
export function normalizeStatisticsResponse(raw: unknown): StatisticsCount {
  const body = extractStatisticsSource(raw);
  return {
    total_revenue: pickNumber(body, "totalRevenue", "total_revenue"),
    total_orders: pickNumber(body, "totalOrders", "total_orders"),
    total_users: pickNumber(body, "totalUsers", "total_users"),
    total_products: pickNumber(body, "totalProducts", "total_products"),
    total_stores: pickNumber(body, "totalStores", "total_stores"),
    total_refunds: pickNumber(body, "totalRefunds", "total_refunds"),
    total_withdraw_requests: pickNumber(body, "totalWithdrawRequests", "total_withdraw_requests"),
    total_out_of_delivery_orders: pickNumber(
      body,
      "totalOutOfDeliveryOrders",
      "total_out_of_delivery_orders"
    ),
    total_shipped_orders: pickNumber(body, "totalShippedOrders", "total_shipped_orders"),
    total_cancelled_orders: pickNumber(body, "totalCancelledOrders", "total_cancelled_orders"),
    total_processing_orders: pickNumber(body, "totalProcessingOrders", "total_processing_orders"),
    total_pending_orders: pickNumber(body, "totalPendingOrders", "total_pending_orders"),
    total_delivered_orders: pickNumber(body, "totalDeliveredOrders", "total_delivered_orders"),
  };
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(v => {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  });
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(v => (v === undefined || v === null ? "" : String(v)));
}

export function normalizeRevenueChartResponse(raw: unknown): RevenueChart {
  const body = unwrapPayload(raw);
  return {
    revenues: asNumberArray(body["revenues"]),
    commissions: asNumberArray(body["commissions"]),
    months: asStringArray(body["months"]),
  };
}
