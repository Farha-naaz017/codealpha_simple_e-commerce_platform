import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useInvalidateUserData } from "@/hooks/use-cart";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "My Cart — ShopVerse" }] }),
  component: CartPage,
});

type CartRow = { id: string; quantity: number; product: Product };

function CartPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const invalidate = useInvalidateUserData();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items").select("id, quantity, product:products(*)")
        .eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as CartRow[]).filter((r) => r.product);
    },
  });

  if (!loading && !user) {
    return <EmptyState title="Please log in" desc="Sign in to view your cart." cta={<Link to="/auth" className="px-6 h-11 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center">Login</Link>} />;
  }

  const subtotal = items.reduce((s, r) => s + Number(r.product.price) * r.quantity, 0);
  const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  const updateQty = async (id: string, q: number) => {
    if (q < 1) return;
    const { error } = await supabase.from("cart_items").update({ quantity: q }).eq("id", id);
    if (error) toast.error(error.message); else invalidate();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) toast.error(error.message); else { invalidate(); toast.success("Removed"); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl md:text-4xl font-black mb-8">My Cart {items.length > 0 && <span className="text-base font-medium text-muted-foreground">({items.length} items)</span>}</h1>

        {isLoading ? <p>Loading…</p> : items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            desc="Add items you love and they'll appear here."
            cta={<Link to="/products" className="px-6 h-11 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center">Start Shopping</Link>}
            icon={<ShoppingBag className="w-12 h-12" />}
          />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-4">
              {items.map((row) => (
                <div key={row.id} className="bg-card rounded-2xl border border-border p-4 flex gap-4 shadow-card">
                  <Link to="/products/$slug" params={{ slug: row.product.slug }} className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                  <img src={row.product.image_url?.includes("assets-v1")? row.product.name.toLowerCase().includes("bedsheet")? "PASTE_BEDSHEET_IMAGE_LINK_HERE": row.product.name.toLowerCase().includes("mixer")? "https://i.pinimg.com/1200x/3c/bd/bb/3cbdbbb539b88c0d5ff6425e7af71d8e.jpg": row.product.name.toLowerCase().includes("boat airdopes")? "https://i.pinimg.com/736x/2f/9c/11/2f9c112fecfc6ed59ce3165d837c0d5b.jpg": row.product.name.toLowerCase().includes("watch")? "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500": "PASTE_DEFAULT_IMAGE_LINK_HERE": row.product.image_url}/>

                    </Link>
                      

                  <div className="flex-1 min-w-0">
                    <Link to="/products/$slug" params={{ slug: row.product.slug }} className="font-semibold line-clamp-2 hover:text-primary">{row.product.name}</Link>
                    
                    {row.product.brand && <div className="text-xs text-muted-foreground mt-0.5">{row.product.brand}</div>}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-bold text-lg">{inr(Number(row.product.price) * row.quantity)}</span>
                      <span className="text-xs text-muted-foreground">({inr(row.product.price)} each)</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => updateQty(row.id, row.quantity - 1)} className="w-8 h-8 grid place-items-center hover:bg-muted rounded-l-full"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center text-sm font-semibold">{row.quantity}</span>
                        <button onClick={() => updateQty(row.id, row.quantity + 1)} className="w-8 h-8 grid place-items-center hover:bg-muted rounded-r-full"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => remove(row.id)} className="text-xs text-muted-foreground hover:text-destructive font-semibold flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-card rounded-2xl border border-border p-6 shadow-card h-fit lg:sticky lg:top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <Row label={`Subtotal (${items.length} items)`} value={inr(subtotal)} />
              <Row label="Delivery" value={delivery === 0 ? <span className="text-accent font-semibold">FREE</span> : inr(delivery)} />
              <Row label="Tax (GST 5%)" value={inr(tax)} />
              <div className="border-t border-border my-4" />
              <Row label={<span className="font-bold text-lg">Total</span>} value={<span className="font-bold text-lg">{inr(total)}</span>} />
              {subtotal > 0 && subtotal < 499 && (
                <p className="text-xs text-secondary mt-2">Add {inr(499 - subtotal)} more for FREE delivery!</p>
              )}
              <button onClick={() => navigate({ to: "/checkout" })} className="mt-5 w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">🔒 Secure checkout • UPI / Card / COD</p>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex justify-between items-center py-2 text-sm">{label}<span>{value}</span></div>;
}

function EmptyState({ title, desc, cta, icon }: { title: string; desc: string; cta: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col"><Header />
      <div className="container mx-auto px-4 py-24 text-center flex-1">
        <div className="w-24 h-24 mx-auto rounded-full bg-muted grid place-items-center text-muted-foreground mb-6">{icon ?? <ShoppingBag className="w-12 h-12" />}</div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2 mb-6">{desc}</p>
        {cta}
      </div>
      <Footer />
    </div>
  );
}
