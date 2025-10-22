import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Send, MapPin } from "lucide-react";
import { motion } from "framer-motion";


const Contact = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0a0a0a] via-[#141414] to-black text-gray-100 py-16 px-4 flex flex-col items-center justify-center">
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center mb-10"
        >
          <img
            src="logo.jpeg"
            alt="Menwear Logo"
            className="h-16 w-auto mb-3 drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold text-white tracking-wide">
            Биз билан боғланинг
          </h1>
          <p className="text-zinc-400 mt-2">Мижозларимиз — бизнинг устувор вазифамиз</p>
        </motion.div>

        {/* CONTACT CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          <Card className="bg-[#111] border border-zinc-800 rounded-2xl shadow-2xl">
            <CardContent className="p-8 space-y-8">
              {/* PHONE */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#c7a45a]/10 rounded-full">
                  <Phone className="h-6 w-6 text-[#c7a45a]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Телефон
                  </h3>
                  <p className="text-zinc-400 text-sm">+998 97 118 10 00</p>
                </div>
              </div>

              {/* TELEGRAM */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#c7a45a]/10 rounded-full">
                  <Send className="h-6 w-6 text-[#c7a45a]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Telegram
                  </h3>
                  <a
                    href="https://t.me/menwearuz_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c7a45a] hover:underline text-sm"
                  >
                    @manwear_uz
                  </a>
                </div>
              </div>

              {/* ADDRESS (ixtiyoriy qo‘shimcha) */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#c7a45a]/10 rounded-full">
                  <MapPin className="h-6 w-6 text-[#c7a45a]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Манзил
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Андижон, ески шахар
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Саволларингиз бўлса, биз билан боғланинг. Биз ҳар бир мижозга
                  ёрдам беришдан хурсанд бўламиз.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Contact;
