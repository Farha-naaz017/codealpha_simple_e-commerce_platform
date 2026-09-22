import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useInvalidateUserData } from "@/hooks/use-cart";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "My Wishlist — ShopVerse" }] }),
  component: WishlistPage,
});

type WishRow = { id: string; product: Product };

function WishlistPage() {
  const { user, loading } = useAuth();
  const invalidate = useInvalidateUserData();

  const { data: items = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist_items").select("id, product:products(*)")
        .eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as WishRow[]).filter((r) => r.product);
    },
  });

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <div className="container mx-auto px-4 py-24 text-center flex-1">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Please log in</h1>
          <p className="text-muted-foreground mt-2 mb-6">Sign in to view your wishlist.</p>
          <Link to="/auth" className="px-6 h-11 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center">Login</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
    if (error) toast.error(error.message); else invalidate();
  };
  const moveToCart = async (productId: string, id: string) => {
    if (!user) return;
    const { error } = await supabase.from("cart_items").upsert({ user_id: user.id, product_id: productId, quantity: 1 }, { onConflict: "user_id,product_id" });
    if (error) { toast.error(error.message); return; }
    await supabase.from("wishlist_items").delete().eq("id", id);
    invalidate();
    toast.success("Moved to cart");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl md:text-4xl font-black mb-8">My Wishlist <span className="text-base font-medium text-muted-foreground">({items.length})</span></h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">Your wishlist is empty</h2>
            <p className="text-muted-foreground mt-2 mb-6">Tap the ♥ on any product to save it for later.</p>
            <Link to="/products" className="px-6 h-11 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((row) => (
              <div key={row.id} className="bg-card rounded-2xl overflow-hidden border border-border shadow-card group">
                <Link to="/products/$slug" params={{ slug: row.product.slug }} className="block aspect-square bg-muted overflow-hidden">
                  {row.product.image_url && <img src={row.product.image_url} alt={row.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                </Link>
                <div className="p-4">
                  <Link to="/products/$slug" params={{ slug: row.product.slug }} className="font-medium text-sm line-clamp-2 hover:text-primary">{row.product.name}</Link>
                  <div className="font-bold mt-2">{inr(row.product.price)}</div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button onClick={() => moveToCart(row.product.id, row.id)} className="h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center justify-center gap-1 hover:opacity-90">
                      <ShoppingCart className="w-3.5 h-3.5" /> Move
                    </button>
                    <button onClick={() => remove(row.id)} className="h-9 rounded-lg border border-border text-xs font-semibold inline-flex items-center justify-center gap-1 hover:bg-muted">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
