import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShoppingBag } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const updateCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (index: number) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    updateCart(newCart);
    toast.success("Маҳсулот ўчирилди");
  };

  const increaseQuantity = (id: string) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updated);
  };

  const decreaseQuantity = (id: string) => {
    const updated = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(updated);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      toast.error("Буюртма бериш учун тизимга киринг");
      navigate("/auth");
      return;
    }
    navigate("/checkout");
  };

  return (
    <Layout>
      <div className="container py-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <img src="/logo.jpeg" alt="Menwear.uz" className="h-12 mb-3 opacity-90" />
          <h1 className="text-3xl font-bold tracking-wide text-gray-100">
            Саватингиз
          </h1>
          <p className="text-gray-400 mt-2">
            Танланган маҳсулотларингизни кўриб чиқинг
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <p className="text-gray-400 mb-6">Саватингиз бўш</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-2"
            >
              Харид қилишни бошлаш
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <Card
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 hover:border-primary/40 transition-all"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* IMAGE + LINK */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl border border-zinc-700 cursor-pointer hover:opacity-80 transition"
                      onClick={() => navigate(`/product/${item.id}`)}
                    />
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-gray-100 cursor-pointer hover:text-primary transition"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:text-white border border-zinc-700 px-2"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          –
                        </Button>
                        <span className="text-gray-200 font-medium min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:text-white border border-zinc-700 px-2"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-lg font-bold text-primary mt-2">
                        ${item.price}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div>
              <Card className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <CardContent>
                  <h2 className="text-2xl font-bold mb-6 text-gray-100">
                    Ҳисоблаш
                  </h2>

                  <div className="space-y-3 mb-6 text-gray-300">
                    <div className="flex justify-between">
                      <span>Маҳсулотлар:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-zinc-700 pt-3 flex justify-between font-bold text-lg">
                      <span>Жами:</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl"
                    onClick={handleCheckout}
                  >
                    Буюртма бериш
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
