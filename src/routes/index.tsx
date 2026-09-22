import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Star, Sparkles, Zap, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard, type Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopVerse — India's Premium Shopping Destination" },
      { name: "description", content: "Shop electronics, fashion, home, beauty and grocery at the best prices. Free delivery, COD, secure UPI checkout." },
    ],
  }),
  component: HomePage,
});

const CATEGORIES = [
  { slug: "electronics", name: "Electronics", emoji: "📱", color: "from-blue-500/20 to-indigo-500/20" },
  { slug: "fashion", name: "Fashion", emoji: "👗", color: "from-pink-500/20 to-rose-500/20" },
  { slug: "home-kitchen", name: "Home & Kitchen", emoji: "🍳", color: "from-amber-500/20 to-orange-500/20" },
  { slug: "beauty", name: "Beauty", emoji: "💄", color: "from-fuchsia-500/20 to-purple-500/20" },
  { slug: "grocery", name: "Grocery", emoji: "🛒", color: "from-emerald-500/20 to-green-500/20" },
];

const TESTIMONIALS = [
  { name: "Ananya Sharma", city: "Mumbai", rating: 5, text: "Lightning fast delivery and authentic products. My go-to for festive shopping!", avatar: "https://i.pravatar.cc/100?img=47" },
  { name: "Rohan Iyer", city: "Bengaluru", rating: 5, text: "Best prices on electronics. The boAt earbuds were ₹400 cheaper than anywhere else.", avatar: "https://i.pravatar.cc/100?img=12" },
  { name: "Priya Verma", city: "Delhi", rating: 4, text: "Loved the Banarasi saree — exactly as shown. Packaging was premium too.", avatar: "https://i.pravatar.cc/100?img=32" },
  { name: "Vikram Patel", city: "Ahmedabad", rating: 5, text: "Order arrived in 2 days. The COD option made it so easy for my parents.", avatar: "https://i.pravatar.cc/100?img=15" },
];

function HomePage() {
  const { data: featured = [] } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*")
        .eq("is_featured", true).limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });
  const { data: trending = [] } = useQuery({
    queryKey: ["products", "trending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*")
        .eq("is_trending", true).limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });
  const { data: bestsellers = [] } = useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*")
        .eq("is_bestseller", true).limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="container mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-28 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20 text-xs font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5" /> Festive Sale Live — Up to 70% off
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
                Discover.{" "}
                <span className="text-gradient">Shop.</span>{" "}
                Enjoy.
              </h1>
              <p className="text-lg text-muted-foreground">
                India's premium online destination for electronics, fashion, home, beauty and grocery —
                handpicked brands, lowest prices, lightning-fast delivery across 19,000+ pin codes.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="group inline-flex items-center gap-2 h-12 px-7 rounded-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-95 transition">
                  Shop Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
                <a href="#categories" className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-card border border-border font-semibold hover:bg-muted transition">
                  Browse Categories
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <div className="text-2xl font-black">2M+</div>
                  <div className="text-xs text-muted-foreground">Happy customers</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="text-2xl font-black">50K+</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="text-2xl font-black flex items-center gap-1">4.8<Star className="w-5 h-5 fill-saffron text-saffron" /></div>
                  <div className="text-xs text-muted-foreground">Avg rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
                <div className="space-y-4 pt-10">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-hover animate-float">
                    <img src="https://i.pinimg.com/736x/a4/a6/6c/a4a66cbc5b73ffd19940ca751e3b97dc.jpg" alt="Fashion" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-hover">
                    <img src="https://i.pinimg.com/736x/e1/d3/ae/e1d3ae862f10a09d3df233eec9408d2c.jpg" alt="Electronics" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-hover">
                    <img src="https://i.pinimg.com/736x/fc/58/e9/fc58e9baec8748002b687c5179d230e4.jpg" alt="Beauty" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-hover animate-float" style={{ animationDelay: "1s" }}>
                    <img src="https://i.pinimg.com/736x/2d/15/51/2d1551e62fba153088f63a608a14154d.jpg" alt="Kitchen" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 shadow-card border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent grid place-items-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Free delivery on</div>
                    <div className="font-bold text-sm">Orders ₹499+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* trust strip */}
        <div className="border-y border-border bg-card">
          <div className="container mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { i: Truck, t: "Free Delivery", s: "On orders ₹499+" },
              { i: ShieldCheck, t: "Secure Payments", s: "UPI, Cards, COD" },
              { i: RotateCcw, t: "Easy 7-Day Returns", s: "No questions asked" },
              { i: Headphones, t: "24×7 Support", s: "Always here to help" },
            ].map(({ i: Icon, t, s }) => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center"><Icon className="w-5 h-5" /></div>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-xs text-muted-foreground">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="container mx-auto px-4 py-16">
        <SectionHeading eyebrow="Browse" title="Shop by Category" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/products"
              search={{ cat: c.slug } as never}
              className={`group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${c.color} border border-border hover:shadow-hover transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="text-5xl mb-3">{c.emoji}</div>
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition">Shop now →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH SALE BANNER */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-sale text-secondary-foreground p-8 md:p-12">
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-2"><Zap className="w-4 h-4" /> FLASH SALE</div>
              <h3 className="text-3xl md:text-5xl font-black">
  Summer Sale — Cool Deals Up To 20% Off
</h3>

<p className="mt-2 opacity-90">
  Use code <span className="font-bold">SUMMER20</span>
</p>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-foreground font-bold hover:scale-105 transition">
              Grab Deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <ProductRow title="Featured Products" eyebrow="Handpicked" products={featured} />

      {/* TRENDING */}
      <ProductRow title="Trending Now" eyebrow="Hot Picks" products={trending} icon={<Tag className="w-4 h-4" />} />

      {/* BEST SELLERS */}
      <ProductRow title="Best Sellers" eyebrow="Most Loved" products={bestsellers} />

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeading eyebrow="Reviews" title="Loved by 2 million Indians" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-hover transition">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-saffron text-saffron" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-10 md:p-14 border border-border">
          <SectionHeading eyebrow="Why ShopVerse" title="Built for the modern Indian shopper" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { t: "Authentic Products", d: "100% genuine items sourced from brand-authorised partners.", i: ShieldCheck },
              { t: "Lightning Delivery", d: "Same-day in metros, 2-3 days everywhere else in India.", i: Zap },
              { t: "Festive Offers", d: "Year-round deals on Diwali, Holi, Independence Day and more.", i: Sparkles },
            ].map(({ t, d, i: Icon }) => (
              <div key={t} className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-12 h-12 rounded-2xl gradient-primary grid place-items-center text-primary-foreground mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-lg">{t}</div>
                <p className="text-sm text-muted-foreground mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{eyebrow}</div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h2>
      </div>
    </div>
  );
}

function ProductRow({ title, eyebrow, products, icon }: { title: string; eyebrow: string; products: Product[]; icon?: React.ReactNode }) {
  if (!products.length) return null;
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">{icon}{eyebrow}</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h2>
        </div>
        <Link to="/products" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
