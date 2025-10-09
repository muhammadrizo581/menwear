import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart } from "lucide-react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  in_stock: boolean;
  brand_id: string;
  category_id: string;
  brands?: { name: string };
  categories?: { name: string };
}

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brand");
  const categoryId = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  // Mobile menu state (integrated on this page)
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [brandId, categoryId]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          brands(name),
          categories(name)
        `)
        .eq("in_stock", true);

      if (brandId) query = query.eq("brand_id", brandId);
      if (categoryId) query = query.eq("category_id", categoryId);

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Маҳсулотларни юклашда хато");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      const updated = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updated);
    } else {
      setCart([
        ...cart,
        { id: product.id, name: product.name, price: product.price, image: product.images[0], quantity: 1 },
      ]);
    }
    toast.success("Маҳсулот саватга қўшилди");
  };

  const decreaseQuantity = (productId: string) => {
    const updated = cart
      .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0);
    setCart(updated);
  };

  const increaseQuantity = (productId: string) => {
    const updated = cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
    setCart(updated);
  };

  const getQuantity = (productId: string) => {
    const found = cart.find((item) => item.id === productId);
    return found ? found.quantity : 0;
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Links for mobile menu
  const pages = [
    { name: "Бош саҳифа", path: "/" },
    { name: "Категориялар", path: "/categories" },
    { name: "Брендлар", path: "/brands" },
    { name: "Сават", path: "/cart" },
    { name: "Профил", path: "/profile" },
  ];

  return (
    <Layout>
      {/* MOBILE HAMBURGER BUTTON (only on small screens) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="p-3 bg-[#1a1a1a]/95 border border-[#2a2a2a] rounded-xl shadow-md text-[#d4af37]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Slide-out mobile menu (in-page) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-50 h-full w-72 bg-[#0b0b0b] border-r border-[#2a2a2a] shadow-xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
                <div className="flex items-center gap-3">
                  <img src="/logo.jpeg" alt="logo" className="h-9 w-9 rounded" />
                  <div>
                    <div className="text-[#d4af37] font-bold">MENWEAR.UZ</div>
                    <div className="text-sm text-zinc-400">Эркаклар кийимлари</div>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-6 flex flex-col gap-4">
                {pages.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => { setMenuOpen(false); navigate(p.path); }}
                    className="text-[#d4af37] text-lg font-medium text-left hover:text-[#b8972f] transition"
                  >
                    {p.name}
                  </button>
                ))}

                <div className="mt-6">
                  <button onClick={() => { setMenuOpen(false); navigate('/cart'); }} className="w-full bg-[#d4af37] text-black font-semibold py-2 rounded">
                    Сават
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* PAGE CONTENT */}
      <div className="min-h-screen bg-[#0c0c0c] text-white">
        <div className="container py-10">
          {/* HERO */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111] via-[#2a2a2a] to-[#0c0c0c] p-12 mb-16 border border-[#2a2a2a] shadow-[0_0_25px_rgba(212,175,55,0.15)]">
            <div className="relative z-10">
              {/* Desktop logo + title (hidden on small screens) */}
              <div className="hidden md:flex items-center gap-3 mb-4">
                <img src="/logo.jpeg" alt="Menwear Logo" className="h-16" />
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-[#d4af37] mb-4 tracking-tight">MENWEAR.UZ</h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
                Хитойдан сифатли эркаклар кийимлари — ҳар бир нарсада шукўҳ ва услуб.
              </p>
              <Button size="lg" className="bg-[#d4af37] text-black hover:bg-[#b8972f] font-semibold rounded-full px-8 py-6 text-lg shadow-lg" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
                Маҳсулотларни кўриш
              </Button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#d4af3710]" />
          </div>

          {/* Search */}
          <div className="mb-10 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input placeholder="Маҳсулот қидириш..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-500 focus:border-[#d4af37] focus:ring-[#d4af37]" />
            </div>
          </div>

          {/* Products grid */}
          <div id="products">
            <h2 className="text-3xl font-bold text-[#d4af37] mb-8 text-center">Маҳсулотлар</h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="bg-[#1a1a1a] border-[#2a2a2a] animate-pulse">
                    <div className="h-64 bg-[#2a2a2a] rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-[#2a2a2a] rounded mb-2" />
                      <div className="h-3 bg-[#2a2a2a] rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-lg">Маҳсулотлар топилмади 😔</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => {
                  const quantity = getQuantity(product.id);
                  return (
                    <Card key={product.id} className="group bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                        {product.brands && <Badge className="absolute top-3 right-3 bg-[#d4af37] text-black font-semibold shadow-md">{product.brands.name}</Badge>}
                      </div>

                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-2xl font-bold text-[#d4af37]">${product.price}</p>
                      </CardContent>

                      <CardFooter className="p-5 pt-0">
                        {quantity > 0 ? (
                          <div className="flex items-center justify-between w-full bg-[#d4af37] text-black rounded-xl px-4 py-3 font-semibold h-[50px]">
                            <button onClick={(e) => { e.stopPropagation(); decreaseQuantity(product.id); }} className="text-black px-3 h-full">–</button>
                            <span className="text-lg font-semibold">{quantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); increaseQuantity(product.id); }} className="text-black px-3 h-full">+</button>
                          </div>
                        ) : (
                          <Button className="w-full bg-[#d4af37] text-black hover:bg-[#b8972f] font-semibold transition-all rounded-xl h-[50px]" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Саватга қўшиш
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
