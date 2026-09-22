import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Youtube, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center font-black text-primary-foreground">M</div>
              <div>
                <div className="font-display text-xl font-extrabold">Mela</div>
                <div className="text-xs opacity-70">Shop the mela, every day</div>
              </div>
            </div>
            <p className="text-sm opacity-70 max-w-sm mb-5">
              India's favourite online mela for electronics, fashion, home essentials, beauty, footwear and groceries — all under one roof, at prices worth celebrating.
            </p>
            <form className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-10 pl-10 pr-3 rounded-full bg-background/10 border border-background/20 placeholder:text-background/40 text-sm outline-none focus:border-secondary"
                />
              </div>
              <button type="button" className="h-10 px-5 rounded-full gradient-sale text-secondary-foreground text-sm font-semibold">
                Subscribe
              </button>
            </form>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 grid place-items-center rounded-full bg-background/10 hover:bg-background/20 transition" aria-label="social">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop" links={[
            { label: "Electronics", to: "/products", search: { cat: "electronics" } },
            { label: "Fashion", to: "/products", search: { cat: "fashion" } },
            { label: "Home & Kitchen", to: "/products", search: { cat: "home-kitchen" } },
            { label: "Beauty", to: "/products", search: { cat: "beauty" } },
            { label: "Grocery", to: "/products", search: { cat: "grocery" } },
            { label: "Footwear", to: "/products", search: { cat: "footwear" } },
            { label: "Toys & Kids", to: "/products", search: { cat: "toys-kids" } },
          ]}/>

          <FooterCol title="Company" links={[
            { label: "About Us", to: "/" },
            { label: "Contact", to: "/" },
            { label: "FAQ", to: "/" },
            { label: "Careers", to: "/" },
            { label: "Blog", to: "/" },
            { label: "Sustainability", to: "/" },
          ]}/>

          <FooterCol title="Help" links={[
            { label: "My Orders", to: "/orders" },
            { label: "Track Order", to: "/orders" },
            { label: "Privacy Policy", to: "/" },
            { label: "Terms of Service", to: "/" },
            { label: "Returns & Refunds", to: "/" },
            { label: "Size Guide", to: "/" },
          ]}/>
        </div>

        <div className="border-t border-background/10 mt-12 pt-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs opacity-70">
          <p>© {new Date().getFullYear()} Mela. All rights reserved.</p>
          <p>Developed by Farha Naaz for CodeAlpha Full Stack Development Internship</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ label: string; to: string; search?: Record<string, string> }> }) {
  return (
    <div>
      <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-90">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} search={l.search as never} className="opacity-70 hover:opacity-100 hover:text-secondary transition">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}