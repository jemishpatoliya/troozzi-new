import type {
  OrderCreateInput,
  OrderCreateResponse,
  OrderDetails,
  PublicProduct,
} from "./types";

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.message ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

export async function listPublicProducts() {
  return requestJson<PublicProduct[]>("/api/products?mode=public");
}

export async function getPublicProductBySlug(slug: string) {
  return requestJson<PublicProduct>(`/api/products/slug/${encodeURIComponent(slug)}?mode=public`);
}

export async function createOrder(input: OrderCreateInput) {
  return requestJson<OrderCreateResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrder(id: string) {
  return requestJson<OrderDetails>(`/api/orders/${id}`);
}
