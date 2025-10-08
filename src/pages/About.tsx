import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const About = () => {
  return (
    <Layout>
      <div className="container py-12">
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <motion.img
            src="/logo.jpeg"
            alt="Menwear.uz Logo"
            className="h-28 w-auto rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.3)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* TITLE */}
        <motion.h1
          className="text-5xl font-bold text-center mb-12 text-[#d4af37]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Биз ҳақимизда
        </motion.h1>

        {/* CONTENT */}
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#0f0f0f] border border-[#2b2b2b] text-white hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] transition-all">
              <CardContent className="p-8">
                <h2 className="text-3xl font-semibold mb-4 text-[#d4af37]">
                  Menwear.uz
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Биз Хитойдан сифатли эркаклар кийимларини импорт қилиб,
                  Ўзбекистонда сотувчи замонавий онлайн дўкон ҳисобланамиз.
                </p>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Мақсадимиз — мижозларимизга энг сифатли маҳсулотларни энг қулай
                  нархларда таклиф этиш.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Барча маҳсулотларимиз танланган ва сифат назорати қилинган.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-[#0f0f0f] border border-[#2b2b2b] text-white hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] transition-all">
              <CardContent className="p-8">
                <h2 className="text-3xl font-semibold mb-6 text-[#d4af37]">
                  Нима учун биз?
                </h2>
                <ul className="space-y-4 text-gray-300">
                  {[
                    "Сифатли маҳсулотлар",
                    "Тез етказиб бериш",
                    "Қулай нархлар",
                    "Профессионал хизмат",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <span className="text-[#d4af37] mr-2">✓</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
