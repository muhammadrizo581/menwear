import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { motion } from "framer-motion";


interface Brand {
  id: string;
  name: string;
  slug: string;
}

const Brands = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");

      if (error) throw error;

      const uniqueBrands =
        data?.filter(
          (brand, index, self) =>
            index === self.findIndex((b) => b.name === brand.name)
        ) || [];

      setBrands(uniqueBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Брендларни юклашда хато");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0a0a0a] via-[#141414] to-black text-gray-100 py-12 px-4">
        {/* LOGO & HEADER */}
        <div className="text-center mb-12">
          <motion.img
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            src="logo.jpeg"
            alt="Menwear Logo"
            className="h-16 mx-auto mb-4 drop-shadow-lg"
          />
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl font-bold text-white tracking-wide"
          >
            Брендлар
          </motion.h1>
          <p className="text-zinc-400 mt-2">
            Сизнинг услубингизга мос брендни танланг
          </p>
        </div>

        {/* BRAND CARDS */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="bg-[#111] border border-zinc-800 animate-pulse rounded-2xl h-20"
              >
                <CardContent className="p-6">
                  <div className="h-6 bg-zinc-800 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">Брендлар топилмади</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  onClick={() => navigate(`/?brand=${brand.id}`)}
                  className="bg-[#111] border border-zinc-800 hover:border-[#c7a45a] transition-all rounded-2xl cursor-pointer group"
                >
                  <CardContent className="p-6 flex justify-center items-center">
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#c7a45a] transition-colors text-[14px]">
                      {brand.name}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Brands;
