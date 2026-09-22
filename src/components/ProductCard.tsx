import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { inr, discountPct } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useInvalidateUserData } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: number;
  mrp?: number | null;
  image_url?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  brand?: string | null;
  stock?: number | null;
};

const getProductImage = (product: Product) => {
  const name = product.name.toLowerCase();

  if (name.includes("airdrop") || name.includes("earbud")) return "https://i.pinimg.com/736x/2f/9c/11/2f9c112fecfc6ed59ce3165d837c0d5b.jpg";
  if (name.includes("smartwatch") || name.includes("colorfit")) return "https://i.pinimg.com/736x/44/8d/93/448d933b4303f88b318f9a416bd225f4.jpg";
  if (name.includes("speaker") || name.includes("jbl")) return "https://i.pinimg.com/1200x/9b/04/50/9b045055e6c7aa939f8aa111eef27ed1.jpg";
  if (name.includes("kurti") || name.includes("biba")) return "https://i.pinimg.com/736x/ce/cb/db/cecbdb9e73f329846d2bb7f2cfb4bee3.jpg";
  if (name.includes("shampoo")) return "https://i.pinimg.com/736x/cd/1e/4f/cd1e4f35753bc0986b0e88b9c6e95f68.jpg";
  if (name.includes("mixer") || name.includes("grinder")) return "https://i.pinimg.com/1200x/3c/bd/bb/3cbdbbb539b88c0d5ff6425e7af71d8e.jpg";
  if (name.includes("hawkins") || name.includes("cookware"))
  return "https://i.pinimg.com/1200x/3b/17/75/3b177547cb0a3ae20494f4b620d7a744.jpg";

  if (name.includes("mouse")) return "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600";
  if (name.includes("face wash")) return "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600";
  if (name.includes("thermosteel") || name.includes("bottle")) return "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600";
  if (name.includes("saree") || name.includes("banarasi"))
  return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600";

  if (name.includes("shirt") || name.includes("peter england"))
  return "https://i.pinimg.com/736x/09/ff/2f/09ff2f0e3289e989fb1ba5e6ea802ad2.jpg";

  if (name.includes("cookware") || name.includes("hawkins"))
  return "https://images.unsplash.com/photo-1584990347449-a590286d7c13?w=600";

  if (name.includes("kurta") || name.includes("kurti") || name.includes("biba"))
  return "https://images.unsplash.com/photo-1583391733981-849840f0e6f0?w=600";

  if (name.includes("watch"))
  return "https://i.pinimg.com/736x/44/8d/93/448d933b4303f88b318f9a416bd225f4.jpg";

  if (name.includes("speaker"))
  return "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600";

  if (name.includes("earbuds") || name.includes("airdopes"))
  return "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600";

  if (name.includes("kitchen") || name.includes("utensil"))
  return "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600";

  if (name.includes("puma") || name.includes("sneaker") || name.includes("shoe"))
  return "https://i.pinimg.com/736x/c6/49/6b/c6496b9ea250f94a41d0db27f99ecfc7.jpg";

  if (name.includes("bedsheet") || name.includes("bombay dyeing"))
  return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600";

  if (name.includes("power bank") || name.includes("samsung"))
  return "https://i.pinimg.com/736x/a8/87/cc/a887cccc25ba0a538ebafd7855a06a6e.jpg";

  // Footwear & kids categories
  if (name.includes("sandal") || name.includes("flip-flop") || name.includes("flip flop"))
  return "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600";

  if (name.includes("loafer") || name.includes("formal shoe"))
  return "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600";

  if (name.includes("toy") || name.includes("lego") || name.includes("building block"))
  return "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600";

  if (name.includes("kids") || name.includes("baby") || name.includes("stroller"))
  return "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600";

  if (name.includes("backpack") || name.includes("school bag"))
  return "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600";

  return product.image_url || "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600";
};
export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const invalidate = useInvalidateUserData();
  const off = discountPct(Number(product.price), product.mrp ? Number(product.mrp) : undefined);

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase
      .from("cart_items")
      .upsert({ user_id: user.id, product_id: product.id, quantity: 1 }, { onConflict: "user_id,product_id" });
    if (error) toast.error(error.message); else { invalidate(); toast.success("Added to cart"); }
  };

  const addToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase
      .from("wishlist_items")
      .upsert({ user_id: user.id, product_id: product.id }, { onConflict: "user_id,product_id" });
    if (error) toast.error(error.message); else { invalidate(); toast.success("Saved to wishlist"); }
  };

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-border/60"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        {getProductImage(product) && (
          <img
            src={getProductImage(product)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        {off > 0 && (
          <span className="absolute top-3 left-3 gradient-sale text-secondary-foreground text-[11px] font-bold px-2 py-1 rounded-full">
            {off}% OFF
          </span>
        )}
        <button
          onClick={addToWishlist}
          className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full glass hover:bg-card transition"
          aria-label="Wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
        {product.stock !== undefined && product.stock !== null && product.stock < 10 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 bg-foreground/80 text-background text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="p-4">
        {product.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{product.brand}</div>}
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition">{product.name}</h3>

        <div className="flex items-center gap-1.5 mt-2 text-xs">
          <span className="bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
            {Number(product.rating ?? 4.2).toFixed(1)}
            <Star className="w-3 h-3 fill-current" />
          </span>
          <span className="text-muted-foreground">({(product.reviews_count ?? 0).toLocaleString("en-IN")})</span>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          <span className="font-bold text-lg">{inr(product.price)}</span>
          {product.mrp && Number(product.mrp) > Number(product.price) && (
            <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
          )}
        </div>

        <button
          onClick={addToCart}
          className="mt-3 w-full h-9 rounded-lg bg-primary/10 text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}