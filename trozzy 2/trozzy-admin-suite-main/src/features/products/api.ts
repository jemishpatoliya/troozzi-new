import type { Product } from "@/lib/mockData";
import type { ProductManagementFormValues } from "./types";

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function listCatalogProducts() {
  return requestJson<Array<{ id: string; name: string; sku: string }>>("/api/products/catalog");
}

export async function listCatalogProductsFull() {
  return requestJson<Product[]>("/api/products?mode=admin");
}

export async function listCategories() {
  return requestJson<Array<{ id: string; name: string; shortDescription: string; description: string; parentId: string | null; order: number; active: boolean; productCount: number; imageUrl?: string }>>(
    "/api/categories",
  );
}

export async function createCategory(input: {
  name: string;
  shortDescription: string;
  description: string;
  parentId: string | null;
  order: number;
  active: boolean;
  imageUrl?: string;
}) {
  return requestJson<{ id: string }>("/api/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCategory(input: {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  parentId: string | null;
  order: number;
  active: boolean;
  imageUrl?: string;
}) {
  return requestJson<{ id: string }>(`/api/categories/${input.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: input.name,
      shortDescription: input.shortDescription,
      description: input.description,
      parentId: input.parentId,
      order: input.order,
      active: input.active,
      imageUrl: input.imageUrl,
    }),
  });
}

export async function deleteCategory(id: string) {
  return requestJson<{ ok: true }>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}

export async function getProductManagement(id: string) {
  return requestJson<ProductManagementFormValues>(`/api/products/${id}/management`);
}

export async function saveProductDraft(input: { id?: string; values: ProductManagementFormValues }) {
  return requestJson<{ id: string }>("/api/products/draft", {
    method: "POST",
    body: JSON.stringify({ id: input.id, values: input.values }),
  });
}

export async function publishProduct(input: { id?: string; values: ProductManagementFormValues }) {
  return requestJson<{ id: string }>("/api/products/publish", {
    method: "POST",
    body: JSON.stringify({ id: input.id, values: input.values }),
  });
}

export async function updateProduct(input: { id: string; values: ProductManagementFormValues }) {
  return requestJson<{ id: string }>(`/api/products/${input.id}`, {
    method: "PUT",
    body: JSON.stringify({ values: input.values }),
  });
}

export async function deleteProduct(id: string) {
  return requestJson<{ ok: true }>(`/api/products/${id}`, { method: "DELETE" });
}

export async function bulkUpdateCatalogProductStatus(input: { ids: string[]; status: Product["status"] }) {
  return requestJson<{ ok: true }>("/api/products/bulk/status", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
