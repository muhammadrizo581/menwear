import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
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

  const removeItem = (index: number) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    toast.success("Маҳсулот ўчирилди");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Сават</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Саватингиз бўш</p>
            <Button onClick={() => navigate("/")}>Харид қилишни бошлаш</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-muted-foreground">Миқдор: {item.quantity}</p>
                      <p className="text-lg font-bold text-primary">${item.price}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Жами</h2>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span>Маҳсулотлар:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Жами:</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
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
