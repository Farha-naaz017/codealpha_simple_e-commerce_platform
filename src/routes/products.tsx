import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard, type Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

type Search = { cat?: string; q?: string; sort?: "popular" | "low" | "high" | "rating" };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    sort: (s.sort as Search["sort"]) ?? "popular",
  }),
  head: () => ({ meta: [{ title: "All Products — ShopVerse" }] }),
  component: ProductsPage,
});

const CATS = [
  { slug: "", name: "All" },
  { slug: "electronics", name: "Electronics" },
  { slug: "fashion", name: "Fashion" },
  { slug: "home-kitchen", name: "Home & Kitchen" },
  { slug: "beauty", name: "Beauty" },
  { slug: "grocery", name: "Grocery" },
];

function ProductsPage() {
  const { cat, q, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [maxPrice, setMaxPrice] = useState(20000);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", cat, q],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories!inner(slug)");
      if (cat) query = query.eq("categories.slug", cat);
      if (q) query = query.ilike("name", `%${q}%`);
      const { data, error } = await query.limit(60);
      if (error) throw error;
      return data as (Product & { categories: { slug: string } })[];
    },
  });

  const sorted = useMemo(() => {
    const list = products.filter((p) => Number(p.price) <= maxPrice);
    switch (sort) {
      case "low": return [...list].sort((a, b) => Number(a.price) - Number(b.price));
      case "high": return [...list].sort((a, b) => Number(b.price) - Number(a.price));
      case "rating": return [...list].sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
      default: return [...list].sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));
    }
  }, [products, sort, maxPrice]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb + title */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <nav className="text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">Products</span>
            {cat && <> / <span className="text-foreground capitalize">{cat.replace("-", " & ")}</span></>}
          </nav>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {cat ? CATS.find(c => c.slug === cat)?.name : q ? `Results for "${q}"` : "All Products"}
            <span className="text-base font-medium text-muted-foreground ml-3">({sorted.length} items)</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-8 flex-1">
        {/* SIDEBAR */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> Categories</h3>
            <ul className="space-y-1">
              {CATS.map((c) => {
                const active = (c.slug || undefined) === cat;
                return (
                  <li key={c.slug}>
                    <button
                      onClick={() => navigate({ search: (prev: Search) => ({ ...prev, cat: c.slug || undefined }) })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${active ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"}`}
                    >
                      {c.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-bold mb-4 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Price</h3>
            <input type="range" min={100} max={20000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>₹100</span>
              <span className="font-semibold text-foreground">Up to ₹{maxPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </aside>

        {/* GRID */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex gap-2 overflow-x-auto lg:hidden">
              {CATS.map((c) => {
                const active = (c.slug || undefined) === cat;
                return (
                  <button
                    key={c.slug}
                    onClick={() => navigate({ search: (prev: Search) => ({ ...prev, cat: c.slug || undefined }) })}
                    className={`px-4 h-9 rounded-full text-xs font-semibold whitespace-nowrap border ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            <select
              value={sort}
              onChange={(e) => navigate({ search: (prev: Search) => ({ ...prev, sort: e.target.value as Search["sort"] }) })}
              className="h-10 px-4 rounded-full bg-card border border-border text-sm font-medium ml-auto"
            >
              <option value="popular">Most Popular</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="text-muted-foreground mt-1">Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
