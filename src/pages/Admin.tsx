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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Илтимос, тизимга кириң");
        navigate("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !roleData || roleData.role !== "admin") {
        toast.error("Сизда админ ҳуқуқлари мавжуд эмас");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Admin tekshirishda xato:", error);
      toast.error("Админ ҳуқуқини текширишда хатолик");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
            <h2 className="text-2xl font-semibold mb-2">Рухсат йўқ ❌</h2>
            <p className="text-muted-foreground mb-4">
              Сиз бу саҳифага кириш ҳуқуқига эга эмассиз.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
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
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Админ панели</h1>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-muted/5 rounded-lg p-1 mb-8 text-white">
            <TabsTrigger value="products">🛍 Маҳсулотлар</TabsTrigger>
            <TabsTrigger value="categories">📂 Категориялар</TabsTrigger>
            <TabsTrigger value="brands">🏷️ Брендлар</TabsTrigger>
            <TabsTrigger value="orders">📦 Буюртмалар</TabsTrigger>
            <TabsTrigger value="users">Фойдаланувчилар</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="brands">
            <BrandsManager />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager />
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
