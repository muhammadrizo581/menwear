import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  product_images: { image_base64: string }[];
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

  // 🔥 Fetch products with multiple images
  const fetchProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_images(image_base64),
          brands(name),
          categories(name)
        `)
        .eq("in_stock", true)
        .order("created_at", { ascending: false });

      if (brandId) query = query.eq("brand_id", brandId);
      if (categoryId) query = query.eq("category_id", categoryId);

      const { data, error } = await query;
      if (error) throw error;

      console.log("Fetched products:", data);

      setProducts(data as any || []);
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
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.product_images?.[0]?.image_base64 || null,
          quantity: 1,
        },
      ]);
    }
    toast.success("Маҳсулот саватга қўшилди");
  };

  const decreaseQuantity = (productId: string) => {
    const updated = cart
      .map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCart(updated);
  };

  const increaseQuantity = (productId: string) => {
    const updated = cart.map((item) =>
      item.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCart(updated);
  };

  const getQuantity = (productId: string) => {
    const found = cart.find((item) => item.id === productId);
    return found ? found.quantity : 0;
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pages = [
    { name: "Бош сахифа", path: "/" },
    { name: "Категориялар", path: "/categories" },
    { name: "Брендлар", path: "/brands" },
    { name: "Профил", path: "/profile" },
  ];

  return (
    <Layout>
      {/* MOBILE HAMBURGER */}
      <div className="md:hidden fixed top-4 left-4 z-50 mt-[-10px]">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="p-3 bg-[#1a1a1a]/95 border border-[#2a2a2a] rounded-xl shadow-md text-[#d4af37]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setMenuOpen(false)}
            />
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
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-zinc-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-6 flex flex-col gap-4">
                {pages.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(p.path);
                    }}
                    className="text-[#d4af37] text-lg font-medium text-left hover:text-[#b8972f] transition"
                  >
                    {p.name}
                  </button>
                ))}
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/cart");
                    }}
                    className="flex gap-2 justify-center w-full bg-[#d4af37] text-black font-semibold py-2 rounded"
                  >
                    Сават <ShoppingCart />
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* PAGE CONTENT */}
      <div className="min-h-screen bg-[#0c0c0c] text-white">
        <div className="w-full mx-auto py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1400px]">
          {/* SEARCH */}
          <div className="mb-10 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Маҳсулот қидириш..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-500 focus:border-[#d4af37] focus:ring-[#d4af37]"
              />
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div id="products">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card
                    key={i}
                    className="bg-[#1a1a1a] border-[#2a2a2a] animate-pulse"
                  >
                    <div className="h-64 bg-[#2a2a2a] rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-[#2a2a2a] rounded mb-2" />
                      <div className="h-3 bg-[#2a2a2a] rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-lg">
                Маҳсулотлар топилмади 😔
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredProducts.map((product) => {
                  const quantity = getQuantity(product.id);
                  const firstImage =
                    product.product_images?.[0]?.image_base64 ||
                    "/placeholder.svg";
                  return (
                    <Card
                      key={product.id}
                      className="group bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-64 object-cover"
                        />
                        {product.brands && (
                          <Badge className="absolute top-3 right-3 bg-[#d4af37] text-black font-semibold shadow-md">
                            {product.brands.name}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-2xl font-bold text-[#d4af37]">
                          ${product.price}
                        </p>
                      </CardContent>

                      <CardFooter className="p-2 pt-0">
                        {quantity > 0 ? (
                          <div className="flex items-center justify-between w-full bg-[#d4af37] text-black rounded-xl px-4 py-3 font-semibold h-[50px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decreaseQuantity(product.id);
                              }}
                              className="text-black px-3 h-full"
                            >
                              –
                            </button>
                            <span className="text-lg font-semibold">
                              {quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                increaseQuantity(product.id);
                              }}
                              className="text-black px-3 h-full"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <Button
                            className="flex gap-0 w-full bg-[#d4af37] text-black hover:bg-[#b8972f] text-[12px] font-semibold transition-all rounded-xl h-[50px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />{" "}
                            <span>Саватга қўшиш</span>
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
