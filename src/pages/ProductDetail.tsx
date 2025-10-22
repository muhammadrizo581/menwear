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
        .select(`
          *,
          categories(name),
          brands(name),
          product_images(image_base64)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Маълумотни юклашда хатолик");
        setLoading(false);
        return;
      }

      const productData = data as any;
      const images =
        productData?.product_images?.map((img: any) => img.image_base64) || [];

      setProduct({ ...productData, images });
      setSelectedImage(images[0] || null);

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((item: any) => item.id === productData.id);
      setCartQty(existing ? existing.quantity : 0);

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

  const increaseQty = () => updateCart(cartQty + 1);
  const decreaseQty = () => updateCart(cartQty - 1);
  const addToCart = () => {
    updateCart(cartQty + 1);
    toast.success("Саватга қўшилди 🛒");
  };

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
      <div className="container py-10 md:py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* === LEFT — IMAGES === */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-lg aspect-square bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] relative">
              <img
                src={selectedImage || product.images?.[0] || "/placeholder.svg"}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-300 "
              />
            </div>

            {/* Thumbnail images */}
            {product.images?.length > 1 && (
              <div className="mt-5 w-full max-w-lg overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 w-max px-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`border-2 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
                        selectedImage === img
                          ? "border-[#d4af37] scale-105 shadow-lg"
                          : "border-[#2a2a2a] hover:border-[#d4af37]/70"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`preview-${i}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* === RIGHT — DETAILS === */}
          <Card className="bg-[#1a1a1a] border border-[#2a2a2a] text-white shadow-2xl rounded-2xl h-auto">
            <CardContent className="p-6 sm:p-8 space-y-5 flex flex-col justify-center">
              {/* Product Name + Brand */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#d4af37] tracking-tight leading-tight">
                  {product.name}
                </h1>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">
                  {product.brands?.name} — {product.categories?.name}
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                {product.description}
              </p>

              {/* Price */}
              <div className="text-3xl sm:text-4xl font-bold text-[#d4af37] pt-2">
                ${product.price}
              </div>

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-[#d4af37] font-semibold mb-2 text-base sm:text-lg">
                    Ўлчамлар:
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((s) => (
                      <span
                        key={s}
                        className="uppercase px-3 py-1 border border-[#d4af37] rounded-full text-sm text-gray-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CART ACTIONS */}
              <div className="pt-4">
                {cartQty > 0 ? (
                  <div className="flex items-center justify-center gap-6">
                    <Button
                      onClick={decreaseQty}
                      variant="outline"
                      className="w-12 h-12 text-2xl font-bold text-white bg-[#2a2a2a] border-[#2a2a2a] rounded-full hover:bg-[#383838]"
                    >
                      –
                    </Button>
                    <span className="text-2xl font-semibold text-[#d4af37] w-10 text-center">
                      {cartQty}
                    </span>
                    <Button
                      onClick={increaseQty}
                      variant="outline"
                      className="w-12 h-12 text-2xl font-bold text-white bg-[#2a2a2a] border-[#2a2a2a] rounded-full hover:bg-[#383838]"
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={addToCart}
                    className="mt-6 w-full bg-[#d4af37] text-black hover:bg-[#b8972f] font-semibold text-lg py-5 rounded-xl transition-all duration-300"
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
