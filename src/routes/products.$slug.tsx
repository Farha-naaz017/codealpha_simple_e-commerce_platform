import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard, type Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useInvalidateUserData } from "@/hooks/use-cart";
import { inr, discountPct } from "@/lib/format";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const invalidate = useInvalidateUserData();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*, categories(slug,name)")
        .eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data as (Product & { category_id: string; categories: { slug: string; name: string } | null }) | null;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*")
        .eq("category_id", product!.category_id)
        .neq("id", product!.id).limit(4);
      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-10">
          <div className="aspect-square rounded-3xl bg-muted animate-pulse" />
          <div className="space-y-4"><div className="h-8 w-3/4 bg-muted animate-pulse rounded" /><div className="h-32 bg-muted animate-pulse rounded" /></div>
        </div>
      </div>
    );
  }
  if (!product) throw notFound();

  const off = discountPct(Number(product.price), product.mrp ? Number(product.mrp) : undefined);
  const inStock = (product.stock ?? 0) > 0;

  const addToCart = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase
      .from("cart_items")
      .upsert({ user_id: user.id, product_id: product.id, quantity: qty }, { onConflict: "user_id,product_id" });
    if (error) toast.error(error.message); else { invalidate(); toast.success("Added to cart"); }
  };
  const buyNow = async () => { await addToCart(); navigate({ to: "/checkout" }); };
  const addWish = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase.from("wishlist_items").upsert({ user_id: user.id, product_id: product.id }, { onConflict: "user_id,product_id" });
    if (error) toast.error(error.message); else { invalidate(); toast.success("Saved to wishlist"); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/products" className="hover:text-foreground">Products</Link>
          {product.categories && <> / <Link to="/products" search={{ cat: product.categories.slug } as never} className="hover:text-foreground">{product.categories.name}</Link></>}
          <span> / <span className="text-foreground">{product.name}</span></span>
        </nav>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10">
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-card border border-border shadow-card relative">
              {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
              {off > 0 && <span className="absolute top-4 left-4 gradient-sale text-secondary-foreground font-bold px-3 py-1.5 rounded-full text-sm">{off}% OFF</span>}
            </div>
          </div>

          <div>
            {product.brand && <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{product.brand}</div>}
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded font-semibold text-sm flex items-center gap-1">
                {Number(product.rating ?? 4.2).toFixed(1)} <Star className="w-3.5 h-3.5 fill-current" />
              </span>
              <span className="text-sm text-muted-foreground">{(product.reviews_count ?? 0).toLocaleString("en-IN")} ratings</span>
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-4xl font-black">{inr(product.price)}</span>
              {product.mrp && Number(product.mrp) > Number(product.price) && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{inr(product.mrp)}</span>
                  <span className="text-accent font-bold">{off}% off</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>

            {product.description && (
              <p className="mt-6 text-foreground/80 leading-relaxed">{product.description}</p>
            )}

            <div className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${inStock ? "text-accent" : "text-destructive"}`}>
              <Check className="w-4 h-4" />
              {inStock ? `In Stock — ${product.stock} units available` : "Out of Stock"}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-border rounded-full overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-11 hover:bg-muted">−</button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock ?? 10, q + 1))} className="w-10 h-11 hover:bg-muted">+</button>
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <button onClick={addToCart} disabled={!inStock} className="h-12 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-40">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={buyNow} disabled={!inStock} className="h-12 rounded-full gradient-sale text-secondary-foreground font-semibold hover:opacity-90 transition disabled:opacity-40">
                Buy Now
              </button>
              <button onClick={addWish} className="h-12 rounded-full border border-border bg-card font-semibold hover:bg-muted transition flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" /> Wishlist
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t border-border">
              {[
                { i: Truck, t: "Free delivery", s: "Orders ₹499+" },
                { i: ShieldCheck, t: "Secure pay", s: "UPI / Card / COD" },
                { i: RotateCcw, t: "7-day return", s: "Easy refunds" },
              ].map(({ i: Icon, t, s }) => (
                <div key={t} className="text-center">
                  <Icon className="w-5 h-5 mx-auto text-primary" />
                  <div className="text-xs font-semibold mt-2">{t}</div>
                  <div className="text-[11px] text-muted-foreground">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-black mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
