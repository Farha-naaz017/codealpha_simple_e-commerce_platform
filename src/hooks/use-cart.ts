import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useCartCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cart-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.reduce((s, r) => s + (r.quantity ?? 0), 0);
    },
  });
}

export function useWishlistCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("wishlist_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useInvalidateUserData() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["cart-count"] });
    qc.invalidateQueries({ queryKey: ["wishlist-count"] });
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  };
}
