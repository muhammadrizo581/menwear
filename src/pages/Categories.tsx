import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center mb-12 text-center"
          >
            <motion.img
              src="/logo.jpeg"
              alt="Menwear Logo"
              className="h-20 w-auto mb-4 rounded-lg shadow-[0_0_25px_rgba(212,175,55,0.3)]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold text-[#d4af37] tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Категориялар
            </motion.h1>
            <motion.p
              className="text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Тури бўйича махсулотларни танланг
            </motion.p>
          </motion.div>

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
            <motion.div
              className="text-center py-20 text-gray-400 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Категориялар топилмади 😔
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
