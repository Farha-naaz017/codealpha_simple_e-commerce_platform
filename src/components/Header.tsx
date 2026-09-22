import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search, ShoppingCart, Heart, User as UserIcon, Menu, X, LogOut, Package,
  Smartphone, Shirt, Home as HomeIcon, Sparkles, ShoppingBasket, Footprints, Baby,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCartCount, useWishlistCount } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORIES = [
  { slug: "electronics", name: "Electronics", icon: Smartphone },
  { slug: "fashion", name: "Fashion", icon: Shirt },
  { slug: "home-kitchen", name: "Home & Kitchen", icon: HomeIcon },
  { slug: "beauty", name: "Beauty", icon: Sparkles },
  { slug: "grocery", name: "Grocery", icon: ShoppingBasket },
  { slug: "footwear", name: "Footwear", icon: Footprints },
  { slug: "toys-kids", name: "Toys & Kids", icon: Baby },
];

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cartCount = 0 } = useCartCount();
  const { data: wishCount = 0 } = useWishlistCount();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined, cat: undefined } as never });
  };

  return (
    <>
      {/* Top strip */}
      <div className="bg-foreground text-background text-xs">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between overflow-hidden">
          <p className="hidden md:block">🎉 Free delivery across India on orders above ₹499</p>
          <div className="flex items-center gap-4">
            <span>Mela Days — Up to 70% off</span>
            <span className="hidden sm:inline opacity-70">|</span>
            <span className="hidden sm:inline">Loved by 3M+ shoppers</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 glass border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3 md:gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-primary grid place-items-center text-primary-foreground font-black shadow-glow">
              M
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-extrabold tracking-tight">Mela</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:block">Shop the mela, every day</div>
            </div>
          </Link>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sarees, gadgets, festive picks..."
              className="w-full pl-10 pr-4 h-11 rounded-full bg-muted/60 border border-transparent focus:border-primary focus:bg-card outline-none text-sm transition"
            />
          </form>

          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {CATEGORIES.slice(0, 3).map((c) => (
              <Link
                key={c.slug}
                to="/products"
                search={{ cat: c.slug } as never}
                className="px-3 py-2 rounded-md hover:bg-muted transition text-foreground/80 hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 ml-auto">
            <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-muted transition" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] grid place-items-center px-1">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] grid place-items-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserIcon className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/orders" })}>
                    <Package className="w-4 h-4 mr-2" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/wishlist" })}>
                    <Heart className="w-4 h-4 mr-2" /> Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex ml-1 rounded-full gradient-primary text-primary-foreground border-0 hover:opacity-90">
                <Link to="/auth">Login</Link>
              </Button>
            )}

            <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="container mx-auto px-4 py-3 space-y-3">
              <form onSubmit={onSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 h-10 rounded-full bg-muted outline-none text-sm"
                />
              </form>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    to="/products"
                    search={{ cat: c.slug } as never}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 text-sm font-medium"
                  >
                    <c.icon className="w-4 h-4 text-primary" />
                    {c.name}
                  </Link>
                ))}
              </div>
              {!user && (
                <Button asChild className="w-full gradient-primary text-primary-foreground border-0">
                  <Link to="/auth" onClick={() => setOpen(false)}>Login / Register</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}