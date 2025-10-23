import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { BrandsManager } from "@/components/admin/BrandsManager";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Илтимос, тизимга кириң");
        navigate("/auth", { replace: true });
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleError) {
        console.error("Role fetch error:", roleError);
        toast.error("Ҳуқуқ маълумотини юклашда хатолик");
        navigate("/", { replace: true });
        return;
      }

      if (!roleData || roleData.role !== "admin") {
        toast.error("Сизда админ ҳуқуқлари мавжуд эмас");
        navigate("/", { replace: true });
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Admin tekshirishda xato:", error);
      toast.error("Админ ҳуқуқини текширишда хатолик");
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
            <p>Юкланмоқда...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-[#d4af37]">
              Рухсат йўқ ❌
            </h2>
            <p className="text-gray-400 mb-5">
              Сиз бу саҳифага кириш ҳуқуқига эга эмассиз.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 bg-[#d4af37] text-black rounded-xl hover:bg-[#b8962d] transition-all duration-200"
            >
              Бош саҳифага қайтиш
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#d4af37]">
          🛠 Админ панели
        </h1>

        <Tabs defaultValue="products" className="w-full">
          {/* ==== TABS LIST ==== */}
            <div className="mb-6">
  <TabsList
    className="
      flex flex-nowrap md:flex-wrap justify-start md:justify-center items-center
      gap-2 md:gap-3
      bg-[#1a1a1a]/90 border border-[#2a2a2a]
      rounded-2xl p-2 md:p-3 shadow-[0_0_10px_rgba(212,175,55,0.1)]
      backdrop-blur-md 
      min-h-[60px] md:min-h-[70px]
      overflow-x-auto md:overflow-visible
      scrollbar-hide
    "
  >
    {[
      { value: "products", label: "🛍 Маҳсулотлар" },
      { value: "categories", label: "📂 Категориялар" },
      { value: "brands", label: "🏷️ Брендлар" },
      { value: "orders", label: "📦 Буюртмалар" },
      { value: "users", label: "👥 Фойдаланувчилар" },
    ].map((tab) => (
      <TabsTrigger
        key={tab.value}
        value={tab.value}
        className="
          flex-shrink-0
          text-sm md:text-base font-medium
          px-4 md:px-6 py-2 md:py-2.5
          rounded-xl transition-all duration-200 text-center
          text-gray-300 hover:text-[#d4af37] hover:bg-[#2a2a2a]
          data-[state=active]:bg-[#d4af37]
          data-[state=active]:text-black
          data-[state=active]:shadow-[0_0_10px_rgba(212,175,55,0.5)]
        "
      >
        {tab.label}
      </TabsTrigger>
    ))}
  </TabsList>
</div>

          {/* ==== TABS CONTENT ==== */}
          <div
            className="
              bg-[#1a1a1a]/90 border border-[#2a2a2a]
              rounded-2xl shadow-[0_0_15px_rgba(212,175,55,0.15)]
              p-4 md:p-6 backdrop-blur-md
            "
          >
            <TabsContent value="products" className="mt-4">
              <ProductsManager />
            </TabsContent>

            <TabsContent value="categories" className="mt-4">
              <CategoriesManager />
            </TabsContent>

            <TabsContent value="brands" className="mt-4">
              <BrandsManager />
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <OrdersManager />
            </TabsContent>

            <TabsContent value="users" className="mt-4">
              <UsersManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
