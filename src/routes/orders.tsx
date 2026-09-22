import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle2, Truck, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "My Orders — ShopVerse" }] }),
  component: OrdersPage,
});

type OrderItem = { id: string; product_name: string; product_image: string | null; price: number; quantity: number };
type Order = {
  id: string; order_number: string; status: string; payment_method: string;
  subtotal: number; delivery_fee: number; tax: number; total: number;
  ship_full_name: string; ship_phone: string; ship_line1: string; ship_city: string; ship_state: string; ship_pincode: string;
  created_at: string; order_items: OrderItem[];
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders").select("*, order_items(*)")
        .eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <div className="container mx-auto px-4 py-24 text-center flex-1">
          <h1 className="text-2xl font-bold">Please log in</h1>
          <Link to="/auth" className="mt-4 inline-flex h-11 px-6 items-center rounded-full gradient-primary text-primary-foreground font-semibold">Login</Link>
        </div><Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl md:text-4xl font-black mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">No orders yet</h2>
            <p className="text-muted-foreground mt-2 mb-6">When you place an order, it'll show up here.</p>
            <Link to="/products" className="px-6 h-11 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => (
              <div key={o.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                <div className="bg-muted/40 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Order ID</div>
                    <div className="font-bold font-mono text-sm">#{o.order_number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Placed on</div>
                    <div className="text-sm font-semibold">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-bold">{inr(o.total)}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="p-6 grid lg:grid-cols-[1fr_280px] gap-6">
                  <div className="space-y-3">
                    {o.order_items.map((it) => (
                      <div key={it.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                          {it.product_image && <img src={it.product_image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm line-clamp-1">{it.product_name}</div>
                          <div className="text-xs text-muted-foreground">Qty {it.quantity} · {inr(it.price)} each</div>
                        </div>
                        <div className="font-semibold text-sm">{inr(Number(it.price) * it.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs space-y-2 bg-muted/30 rounded-xl p-4">
                    <div className="font-bold text-foreground text-sm mb-1">Delivering to</div>
                    <div>{o.ship_full_name}</div>
                    <div className="text-muted-foreground">{o.ship_line1}, {o.ship_city}, {o.ship_state} - {o.ship_pincode}</div>
                    <div className="text-muted-foreground">📞 {o.ship_phone}</div>
                    <div className="pt-2 mt-2 border-t border-border">
                      <div className="text-foreground font-semibold">Payment: {o.payment_method === "cod" ? "Cash on Delivery" : "UPI / Card"}</div>
                    </div>
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    pending: { icon: <Clock className="w-3.5 h-3.5" />, cls: "bg-secondary/15 text-secondary", label: "Pending" },
    confirmed: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: "bg-primary/15 text-primary", label: "Confirmed" },
    shipped: { icon: <Truck className="w-3.5 h-3.5" />, cls: "bg-accent/15 text-accent", label: "Shipped" },
    delivered: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: "bg-accent/15 text-accent", label: "Delivered" },
  };
  const s = map[status] ?? map.pending;
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${s.cls}`}>{s.icon} {s.label}</span>;
}
