/**
 * All data operations use Supabase client directly from the browser.
 * No api-server dependency for data — checkout still goes through /api/checkout.
 */
import { useQuery, useMutation, UseQueryOptions } from "@tanstack/react-query";
import { supabase as _supabase } from "./supabase";

function db() {
  if (!_supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
  return _supabase;
}

// ---------------------------------------------------------------------------
// Types — column names match the actual Supabase tables
// ---------------------------------------------------------------------------

export interface Wallpaper {
  id: string;
  name: string;
  category: string;
  style: string | null;
  price: number;
  image_url: string;
  additional_images: string[] | null;
  drive_url: string | null;
  featured: boolean;
  created_at: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface Order {
  id: string;
  customer_email: string;
  product: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface OrderStats {
  total_revenue: number;
  total_orders: number;
  orders_today: number;
  revenue_today: number;
  revenue_by_type: { type: string; revenue: number }[];
  recent_orders: {
    created_at: string;
    customer_email: string;
    product: string;
    amount: number;
  }[];
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  wallpaper_count: number;
  price: number;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const getListWallpapersQueryKey = (
  params?: { featured?: boolean; category?: string } | object
) => ["wallpapers", params ?? {}] as const;

export const getGetCategoriesQueryKey = () => ["categories"] as const;

export const getGetWallpaperQueryKey = (id: string) => ["wallpaper", id] as const;

export const getGetStylesQueryKey = () => ["styles"] as const;

export const getListOrdersQueryKey = () => ["orders"] as const;

export const getGetOrderStatsQueryKey = () => ["order-stats"] as const;

export const getListBundlesQueryKey = () => ["bundles"] as const;

export const getListPromosQueryKey = () => ["promos"] as const;

export const getGetSettingsQueryKey = () => ["settings"] as const;

// ---------------------------------------------------------------------------
// Wallpapers
// ---------------------------------------------------------------------------

export function useListWallpapers(
  params?: { featured?: boolean; category?: string },
  options?: { query?: Partial<UseQueryOptions<Wallpaper[]>> }
) {
  return useQuery<Wallpaper[]>({
    queryKey: getListWallpapersQueryKey(params),
    queryFn: async () => {
      let q = db().from("wallpapers").select("*").order("created_at", { ascending: false });
      if (params?.featured === true) q = q.eq("featured", true);
      if (params?.category) q = q.eq("category", params.category);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Wallpaper[];
    },
    ...options?.query,
  });
}

export function useCreateWallpaper() {
  return useMutation({
    mutationFn: async ({ data }: { data: Omit<Wallpaper, "id" | "created_at"> }) => {
      const { data: row, error } = await db()
        .from("wallpapers")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return row as Wallpaper;
    },
  });
}

export function useUpdateWallpaper() {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Wallpaper, "id" | "created_at">>;
    }) => {
      const { data: row, error } = await db()
        .from("wallpapers")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as Wallpaper;
    },
  });
}

export function useDeleteWallpaper() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await db().from("wallpapers").delete().eq("id", id);
      if (error) throw error;
    },
  });
}

export function useGetWallpaper(
  id: string,
  options?: { query?: Partial<UseQueryOptions<Wallpaper>> }
) {
  return useQuery<Wallpaper>({
    queryKey: getGetWallpaperQueryKey(id),
    queryFn: async () => {
      const { data, error } = await db()
        .from("wallpapers")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Wallpaper;
    },
    enabled: !!id,
    ...options?.query,
  });
}

// ---------------------------------------------------------------------------
// Categories (derived from wallpapers table, grouped client-side)
// ---------------------------------------------------------------------------

export function useGetCategories(options?: {
  query?: Partial<UseQueryOptions<CategoryCount[]>>;
}) {
  return useQuery<CategoryCount[]>({
    queryKey: getGetCategoriesQueryKey(),
    queryFn: async () => {
      const { data, error } = await db().from("wallpapers").select("category");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.category] = (counts[row.category] ?? 0) + 1;
      }
      return Object.entries(counts).map(([category, count]) => ({ category, count }));
    },
    ...options?.query,
  });
}

// ---------------------------------------------------------------------------
// Styles (derived from wallpapers table, unique non-null style values)
// ---------------------------------------------------------------------------

export function useGetStyles(options?: {
  query?: Partial<UseQueryOptions<string[]>>;
}) {
  return useQuery<string[]>({
    queryKey: getGetStylesQueryKey(),
    queryFn: async () => {
      const { data, error } = await db().from("wallpapers").select("style");
      if (error) throw error;
      const seen = new Set<string>();
      for (const row of data ?? []) {
        if (row.style) seen.add(row.style);
      }
      return Array.from(seen).sort();
    },
    ...options?.query,
  });
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async ({ data }: { data: { email: string } }) => {
      const { error } = await db()
        .from("newsletter_subscribers")
        .insert({ email: data.email });
      if (error) throw error;
    },
  });
}

// ---------------------------------------------------------------------------
// Checkout (Vercel serverless function at /api/checkout)
// ---------------------------------------------------------------------------

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: {
        type: string;
        price: number;
        name: string;
        wallpaper_id?: string;
        bundle_name?: string;
      };
    }): Promise<{ url: string }> => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Checkout error: ${res.status}`);
      return body;
    },
  });
}

// ---------------------------------------------------------------------------
// Orders  (columns: id, customer_email, product, amount, status, created_at)
// ---------------------------------------------------------------------------

export function useListOrders(options?: {
  query?: Partial<UseQueryOptions<Order[]>>;
}) {
  return useQuery<Order[]>({
    queryKey: getListOrdersQueryKey(),
    queryFn: async () => {
      const { data, error } = await db()
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
    ...options?.query,
  });
}

export function useUpdateOrder() {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Order, "status">>;
    }) => {
      const { data: row, error } = await db()
        .from("orders")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as Order;
    },
  });
}

export const getOrdersByEmailQueryKey = (email: string) => ["orders", "by-email", email] as const;

export function useGetOrdersByEmail(
  email: string,
  options?: { query?: Partial<UseQueryOptions<Order[]>> }
) {
  return useQuery<Order[]>({
    queryKey: getOrdersByEmailQueryKey(email),
    queryFn: async () => {
      const { data, error } = await db()
        .from("orders")
        .select("*")
        .eq("customer_email", email)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
    enabled: !!email,
    ...options?.query,
  });
}

export function useDeleteOrder() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await db().from("orders").delete().eq("id", id);
      if (error) throw error;
    },
  });
}

export function useGetOrderStats(options?: {
  query?: Partial<UseQueryOptions<OrderStats>>;
}) {
  return useQuery<OrderStats>({
    queryKey: getGetOrderStatsQueryKey(),
    queryFn: async () => {
      const { data, error } = await db()
        .from("orders")
        .select("amount, product, customer_email, created_at, status")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const orders = (data ?? []) as Pick<
        Order,
        "amount" | "product" | "customer_email" | "created_at" | "status"
      >[];

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      let total_revenue = 0;
      let revenue_today = 0;
      let orders_today = 0;
      const byType: Record<string, number> = {};

      for (const o of orders) {
        const amount = Number(o.amount);
        total_revenue += amount;
        byType[o.product] = (byType[o.product] ?? 0) + amount;
        if (new Date(o.created_at) >= todayStart) {
          orders_today++;
          revenue_today += amount;
        }
      }

      return {
        total_revenue,
        total_orders: orders.length,
        orders_today,
        revenue_today,
        revenue_by_type: Object.entries(byType).map(([type, revenue]) => ({
          type,
          revenue,
        })),
        recent_orders: orders.slice(0, 5).map((o) => ({
          created_at: o.created_at,
          customer_email: o.customer_email,
          product: o.product,
          amount: Number(o.amount),
        })),
      };
    },
    ...options?.query,
  });
}

// ---------------------------------------------------------------------------
// Bundles  (columns: id, name, description, price, wallpaper_count, is_popular, is_active)
// ---------------------------------------------------------------------------

export function useListBundles(options?: {
  query?: Partial<UseQueryOptions<Bundle[]>>;
}) {
  return useQuery<Bundle[]>({
    queryKey: getListBundlesQueryKey(),
    queryFn: async () => {
      const { data, error } = await db()
        .from("bundles")
        .select("*")
        .order("price", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Bundle[];
    },
    ...options?.query,
  });
}

export function useCreateBundle() {
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: Omit<Bundle, "id" | "created_at">;
    }) => {
      const { data: row, error } = await db()
        .from("bundles")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return row as Bundle;
    },
  });
}

export function useUpdateBundle() {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Bundle, "id" | "created_at">>;
    }) => {
      const { data: row, error } = await db()
        .from("bundles")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as Bundle;
    },
  });
}

export function useDeleteBundle() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await db().from("bundles").delete().eq("id", id);
      if (error) throw error;
    },
  });
}

// ---------------------------------------------------------------------------
// Promo codes  (columns: id, code, discount_type, discount_value, max_uses, uses_count, expires_at, is_active)
// ---------------------------------------------------------------------------

export function useListPromos(options?: {
  query?: Partial<UseQueryOptions<PromoCode[]>>;
}) {
  return useQuery<PromoCode[]>({
    queryKey: getListPromosQueryKey(),
    queryFn: async () => {
      const { data, error } = await db()
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PromoCode[];
    },
    ...options?.query,
  });
}

export function useCreatePromo() {
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: Omit<PromoCode, "id" | "created_at" | "uses_count">;
    }) => {
      const { data: row, error } = await db()
        .from("promo_codes")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return row as PromoCode;
    },
  });
}

export function useUpdatePromo() {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<PromoCode, "id" | "created_at">>;
    }) => {
      const { data: row, error } = await db()
        .from("promo_codes")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row as PromoCode;
    },
  });
}

export function useDeletePromo() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await db().from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
  });
}

// ---------------------------------------------------------------------------
// Admin settings  (columns: key, value — stored as key-value rows)
// ---------------------------------------------------------------------------

export function useGetSettings(options?: {
  query?: Partial<UseQueryOptions<Record<string, string>>>;
}) {
  return useQuery<Record<string, string>>({
    queryKey: getGetSettingsQueryKey(),
    queryFn: async () => {
      const { data, error } = await db().from("admin_settings").select("*");
      if (error) throw error;
      const result: Record<string, string> = {};
      for (const row of data ?? []) {
        result[row.key] = row.value;
      }
      return result;
    },
    ...options?.query,
  });
}

export function useSaveSettings() {
  return useMutation({
    mutationFn: async ({ data }: { data: Record<string, string> }) => {
      const rows = Object.entries(data).map(([key, value]) => ({ key, value }));
      const { error } = await db()
        .from("admin_settings")
        .upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
  });
}
