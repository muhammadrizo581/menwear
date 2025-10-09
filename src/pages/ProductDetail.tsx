import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes?: string[];
  categories?: { name: string };
  brands?: { name: string };
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cartQty, setCartQty] = useState<number>(0);

  useEffect(() => {
    const loadProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name), brands(name)")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Маълумотни юклашда хатолик");
      } else {
        setProduct(data);
        setSelectedImage(data.images?.[0] || null);

        // check if product already in cart
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find((item: any) => item.id === data.id);
        setCartQty(existing ? existing.quantity : 0);
      }

      setLoading(false);
    };

    loadProduct();
  }, [id]);

  const updateCart = (newQty: number) => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);

    if (existingIndex > -1) {
      if (newQty <= 0) cart.splice(existingIndex, 1);
      else cart[existingIndex].quantity = newQty;
    } else if (newQty > 0) {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "/placeholder.jpg",
        quantity: newQty,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartQty(newQty);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addToCart = () => {
    updateCart(cartQty + 1);
    toast.success("Саватга қўшилди 🛒");
  };

  const increaseQty = () => updateCart(cartQty + 1);
  const decreaseQty = () => updateCart(cartQty - 1);

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen text-lg text-gray-400">
          Юкланмоқда...
        </div>
      </Layout>
    );

  if (!product)
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen text-lg text-gray-400">
          Маҳсулот топилмади
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT — PRODUCT IMAGE */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md aspect-[4/5] bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl">
              <img
                src={selectedImage || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-contain bg-[#0b0b0b] transition-transform duration-300 hover:scale-105"
              />
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-5 flex-wrap justify-center">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`border rounded-lg overflow-hidden ${
                      selectedImage === img
                        ? "border-[#d4af37] ring-2 ring-[#d4af37]/40"
                        : "border-[#2a2a2a]"
                    } hover:border-[#d4af37] transition`}
                  >
                    <img
                      src={img}
                      alt={`preview-${i}`}
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — PRODUCT INFO */}
          <Card className="bg-[#1a1a1a] border border-[#2a2a2a] text-white shadow-xl">
            <CardContent className="p-6 space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-[#d4af37]">
                  {product.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {product.brands?.name} — {product.categories?.name}
                </p>
              </div>

              <p className="text-gray-400 leading-relaxed">
                {product.description}
              </p>

              <div className="text-2xl font-semibold text-[#d4af37]">
                ${product.price}
              </div>

              {product.sizes?.length > 0 && (
                <div>
                  <h3 className="text-[#d4af37] font-semibold mb-1">
                    Ўлчамлар:
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((s: string) => (
                      <span
                        key={s}
                        className="px-3 py-1 border border-[#d4af37] rounded-full text-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CART BUTTONS */}
              <div className="pt-6">
                {cartQty > 0 ? (
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={decreaseQty}
                      variant="ghost"
                      className="text-gray-300 hover:text-white border border-zinc-700 px-3"
                    >
                      –
                    </Button>
                    <span className="text-xl font-semibold text-gray-200">
                      {cartQty}
                    </span>
                    <Button
                      onClick={increaseQty}
                      variant="ghost"
                      className="text-gray-300 hover:text-white border border-zinc-700 px-3"
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={addToCart}
                    className="w-full bg-[#d4af37] text-black hover:bg-[#b8972f] font-semibold text-lg py-6"
                  >
                    🛒 Саватга қўшиш
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
