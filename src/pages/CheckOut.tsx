import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Checkout = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    telegram_username: "",
  });

  // 🛒 Savatni olish
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  // 👤 Foydalanuvchini olish
  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return;

      const user = data?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, telegram_username")
        .eq("id", user.id)
        .single();

      if (profile) {
        setForm({
          customer_name: profile.full_name || "",
          customer_phone: profile.phone || "",
          telegram_username: profile.telegram_username || "",
        });
      }
    };

    fetchUserData();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 🧾 Buyurtmani yuborish
  const handleOrder = async () => {
  if (!form.customer_name || !form.customer_phone) {
    toast.error("Илтимос, барча маълумотларни тўлдиринг");
    return;
  }

  setLoading(true);
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      toast.error("Фойдаланувчи маълумоти топилмади");
      return;
    }

    // 1️⃣ orders ga yozish
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          total_price: total,
          status: "Yangi",
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          // items not null bo'lgani uchun yozamiz:
          items: cart, // JSON bo'lib saqlanadi
        },
      ])
      .select("id")
      .single();

    if (orderError) throw orderError;

    // 2️⃣ order_items ga yozish
    const orderItems = cart.map((item) => ({
      order_id: newOrder.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await (supabase as any)
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3️⃣ Telegram xabari
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    const message = `
🛍️ <b>Yangi buyurtma</b>
👤 <b>Ism:</b> ${form.customer_name}
📞 <b>Telefon:</b> ${form.customer_phone}
📨 <b>Telegram:</b> ${form.telegram_username || "-"}

🧾 <b>Mahsulotlar:</b>
${cart.map((i) => `• ${i.name} x${i.quantity} — $${i.price}`).join("\n")}

💰 <b>Jami:</b> $${total.toFixed(2)}
`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    toast.success("Буюртма муваффақиятли жўнатилди!");
    localStorage.removeItem("cart");
    navigate("/");
  } catch (err: any) {
    console.error("Order error:", err);
    toast.error("Буюртмани юборишда хато");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white px-4 py-6">
      <motion.div
        className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.15)] p-6 sm:p-8 space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-[#d4af37] text-2xl sm:text-3xl font-bold text-center">
          🛒 Буюртмани расмийлаштириш
        </h1>

        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-lg">
            Сават бўш 😔
          </div>
        ) : (
          <>
            <div className="space-y-3 border-b border-[#2a2a2a] pb-3 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-gray-300 bg-[#111] px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition"
                >
                  <span>{item.name}</span>
                  <span className="text-[#d4af37] font-semibold">
                    {item.quantity} x ${item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-lg sm:text-xl font-bold text-[#d4af37] mt-3">
              <span>Жами:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Full Name
                </label>
                <Input
                  placeholder="Исм Фамилия"
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm({ ...form, customer_name: e.target.value })
                  }
                  className="bg-[#111] border-[#2a2a2a] text-white focus:border-[#d4af37] rounded-xl h-11"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Phone Number
                </label>
                <Input
                  placeholder="+998901234567"
                  value={form.customer_phone}
                  onChange={(e) =>
                    setForm({ ...form, customer_phone: e.target.value })
                  }
                  className="bg-[#111] border-[#2a2a2a] text-white focus:border-[#d4af37] rounded-xl h-11"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Telegram Username
                </label>
                <Input
                  placeholder="@username"
                  value={form.telegram_username}
                  onChange={(e) =>
                    setForm({ ...form, telegram_username: e.target.value })
                  }
                  className="bg-[#111] border-[#2a2a2a] text-white focus:border-[#d4af37] rounded-xl h-11"
                />
              </div>
            </div>

            <Button
              onClick={handleOrder}
              disabled={loading}
              className="w-full mt-4 bg-[#d4af37] text-black font-semibold hover:bg-[#b8972f] rounded-xl py-4 text-lg transition-all duration-200"
            >
              {loading ? "Юкланмоқда..." : "Буюртмани жўнатиш"}
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Checkout;
