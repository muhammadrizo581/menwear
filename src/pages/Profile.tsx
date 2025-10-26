import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          navigate("/auth");
          return;
        }

        // 🧍 Profil ma’lumotlari
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // 📦 Buyurtmalar (endi JSON field “items” orqali)
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (orderError) throw orderError;
        setOrders(orderData || []);
      } catch (err: any) {
        console.error("Error loading profile:", err);
        toast.error("Маълумотларни юклашда хато: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
          <div className="animate-pulse text-[#d4af37] text-xl">
            Юкланмоқда...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#0c0c0c] text-white">
        <div className="container mx-auto px-4 py-10">
          {/* HEADER */}
          <div className="flex flex-col items-center mb-10 text-center">
            <img
              src="/logo.jpeg"
              alt="Menwear Logo"
              className="h-16 w-auto mb-4 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#d4af37] tracking-tight">
              Профил
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Шахсий маълумотларингиз ва буюртмалар
            </p>
          </div>

          {/* PROFILE CARD */}
          <div className="max-w-xl mx-auto mb-10">
            <Card className="bg-[#1a1a1a] border border-[#2a2a2a] shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#d4af37] text-lg sm:text-xl">
                  Шахсий маълумотлар
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm sm:text-base">
                <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
                  <span className="text-gray-400">Исм:</span>
                  <span className="font-semibold text-[#d4af37] text-right break-all">
                    {profile?.full_name || "—"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
                  <span className="text-gray-400">Телефон:</span>
                  <span className="font-semibold text-[#d4af37] text-right break-all">
                    {profile?.phone || "—"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Telegram:</span>
                  <span className="font-semibold text-[#d4af37] text-right break-all">
                    {profile?.telegram_username || "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ORDERS LIST */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#d4af37] text-2xl font-bold mb-5 text-center">
              Менинг буюртмаларим
            </h2>

            {orders.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                Сизда ҳали буюртмалар йўқ 😔
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const items = order.items || [];
                  return (
                    <Card
                      key={order.id}
                      className="bg-[#1a1a1a]/95 border border-[#2a2a2a] shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                    >
                      <CardHeader className="pb-2 border-b border-[#2a2a2a]">
                        <CardTitle className="text-[#d4af37] text-lg">
                          📦 Буюртма #{order.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleString("uz-UZ")}
                        </p>
                      </CardHeader>

                      <CardContent className="pt-4 space-y-3">
                        {items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 border-b border-[#2a2a2a] pb-3"
                          >
                            <img
                              src={
                                item.image
                                  ? item.image
                                  : "/placeholder.svg"
                              }
                              alt={item.name || "Mahsulot"}
                              className="w-16 h-16 rounded object-cover border border-[#333]"
                            />

                            <div className="flex-1">
                              <p className="text-white font-semibold">
                                {item.name || "—"}
                              </p>
                              <p className="text-sm text-gray-400">
                                {item.quantity} × ${item.price}
                              </p>
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-between text-[#d4af37] font-bold pt-2">
                          <span>Жами:</span>
                          <span>${order.total_price?.toFixed(2)}</span>
                        </div>
                      </CardContent>
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

export default Profile;
