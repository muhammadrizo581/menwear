import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Категорияларни юклашда хато");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#0c0c0c] text-white">
        <div className="container py-12">
          {/* HEADER */}
          <div className="flex flex-col items-center mb-12 text-center">
            <img
              src="/logo.jpeg"
              alt="Menwear Logo"
              className="h-20 w-auto mb-4 rounded-lg shadow-[0_0_25px_rgba(212,175,55,0.3)]"
            />
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#d4af37] tracking-tight">
              Категориялар
            </h1>
            <p className="text-gray-400 mt-2">
              Тури бўйича махсулотларни танланг
            </p>
          </div>

          {/* CATEGORIES GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse bg-[#1a1a1a] border-[#2a2a2a]"
                >
                  <CardContent className="p-6">
                    <div className="h-6 bg-[#2a2a2a] rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-lg">
              Категориялар топилмади 😔
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all duration-300 cursor-pointer text-center"
                  onClick={() => navigate(`/?category=${category.id}`)}
                >
                  <CardContent className="p-10">
                    <h3 className="text-2xl font-semibold text-[#d4af37] mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Маҳсулотларни кўриш →
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
