import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CreditCard, Wallet, MapPin, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useInvalidateUserData } from "@/hooks/use-cart";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — ShopVerse" }] }),
  component: CheckoutPage,
});

type CartRow = { id: string; quantity: number; product: Product };

function CheckoutPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const invalidate = useInvalidateUserData();
  const [placing, setPlacing] = useState(false);
  const [payment, setPayment] = useState<"upi" | "cod">("cod");
  const [form, setForm] = useState({
    full_name: "", phone: "", line1: "", city: "", state: "", pincode: "",
  });

  const { data: items = [] } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items").select("id, quantity, product:products(*)").eq("user_id", user!.id);
      if (error) throw error;
      return (data as unknown as CartRow[]).filter((r) => r.product);
    },
  });

  if (!loading && !user) { navigate({ to: "/auth" }); return null; }
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <div className="container mx-auto px-4 py-24 text-center flex-1">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <Link to="/products" className="mt-6 inline-flex h-11 px-6 items-center rounded-full gradient-primary text-primary-foreground font-semibold">Shop now</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = items.reduce((s, r) => s + Number(r.product.price) * r.quantity, 0);
  const delivery = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  const placeOrder = async () => {
    if (!user) return;
    for (const k of Object.keys(form) as (keyof typeof form)[]) {
      if (!form[k].trim()) { toast.error("Please fill all address fields"); return; }
    }
    if (!/^\d{10}$/.test(form.phone)) { toast.error("Enter a valid 10-digit phone"); return; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }

    setPlacing(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id, status: "confirmed", payment_method: payment,
      subtotal, delivery_fee: delivery, tax, total,
      ship_full_name: form.full_name, ship_phone: form.phone,
      ship_line1: form.line1, ship_city: form.city, ship_state: form.state, ship_pincode: form.pincode,
    }).select().single();
    if (error || !order) { toast.error(error?.message ?? "Failed"); setPlacing(false); return; }

    const orderItems = items.map((r) => ({
      order_id: order.id, product_id: r.product.id,
      product_name: r.product.name, product_image: r.product.image_url ?? null,
      price: r.product.price, quantity: r.quantity,
    }));
    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    invalidate();
    setPlacing(false);
    toast.success(`Order placed! #${order.order_number}`);
    navigate({ to: "/orders" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl md:text-4xl font-black mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h3 className="font-bold flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-primary" /> Shipping Address</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                <Field label="Mobile Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="10-digit" />
                <Field label="Address" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} className="sm:col-span-2" />
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                <Field label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} placeholder="6-digit" />
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h3 className="font-bold flex items-center gap-2 mb-4"><CreditCard className="w-4 h-4 text-primary" /> Payment Method</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <PayOption icon={<Wallet className="w-5 h-5" />} label="Cash on Delivery" desc="Pay when delivered" active={payment === "cod"} onClick={() => setPayment("cod")} />
                <PayOption icon={<CreditCard className="w-5 h-5" />} label="UPI / Cards" desc="Secure online payment" active={payment === "upi"} onClick={() => setPayment("upi")} />
              </div>
              {payment === "upi" && (
                <p className="text-xs text-muted-foreground mt-3">💡 Demo only — UPI gateway not connected. Order will be placed for demo purposes.</p>
              )}
            </div>
          </div>

          <aside className="bg-card rounded-2xl border border-border p-6 shadow-card h-fit lg:sticky lg:top-24">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4">
              {items.map((r) => (
                <div key={r.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {r.product.image_url && <img src={r.product.image_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1">{r.product.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {r.quantity}</div>
                  </div>
                  <div className="font-semibold">{inr(Number(r.product.price) * r.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={inr(subtotal)} />
              <Row label="Delivery" value={delivery === 0 ? <span className="text-accent font-semibold">FREE</span> : inr(delivery)} />
              <Row label="Tax (GST 5%)" value={inr(tax)} />
              <div className="border-t border-border my-2" />
              <Row label={<span className="font-bold text-lg">Total</span>} value={<span className="font-bold text-lg">{inr(total)}</span>} />
            </div>
            <button onClick={placeOrder} disabled={placing} className="mt-5 w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
              {placing ? "Placing..." : <>Place Order <Check className="w-4 h-4" /></>}
            </button>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, className = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:border-primary outline-none text-sm" />
    </label>
  );
}
function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex justify-between items-center">{label}<span>{value}</span></div>;
}
function PayOption({ icon, label, desc, active, onClick }: { icon: React.ReactNode; label: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`text-left p-4 rounded-xl border-2 transition ${active ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
      <div className={`w-9 h-9 rounded-lg grid place-items-center mb-2 ${active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{icon}</div>
      <div className="font-semibold text-sm">{label}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}
