import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Профилни юклашда хато");
    } finally {
      setLoading(false);
    }
  };

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
          {/* LOGO & HEADER */}
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
              Шахсий маълумотларингиз
            </p>
          </div>

          {/* PROFILE CARD */}
          <div className="max-w-xl mx-auto">
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

            {/* ORDERS BUTTON */}
            <div className="mt-8">
              <Button
                onClick={() => navigate("/orders")}
                className="w-full bg-[#d4af37] text-black font-semibold hover:bg-[#b8952e] transition-all duration-300 text-sm sm:text-base py-5 rounded-xl"
              >
                Менинг буюртмаларим
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
