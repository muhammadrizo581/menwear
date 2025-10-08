import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";



const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Муваффақиятли кирдингиз");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Кириш хатолиги");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            telegram_username: telegramUsername,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast.success("Рўйхатдан ўтдингиз! Email манзилингизни тасдиқланг");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Рўйхатдан ўтиш хатолиги");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#000000] text-gray-100 px-4 py-10">
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center mb-8"
        >
          <img src="/logo.jpeg" alt="Menwear Logo" className="h-16 w-auto mb-3 drop-shadow-lg" />
          <h1 className="text-3xl font-semibold tracking-wide text-white">Menwear.uz</h1>
          <p className="text-sm text-zinc-400">Эркаклар кийимида янги стандарт</p>
        </motion.div>

        {/* AUTH CARD */}
        <Card className="w-full max-w-md bg-[#111] border border-zinc-800 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold text-white">
              Хуш келибсиз
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-900 mb-6 rounded-lg">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-[#c7a45a] data-[state=active]:text-black text-gray-300"
                >
                  Кириш
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-[#c7a45a] data-[state=active]:text-black text-gray-300"
                >
                  Рўйхатдан ўтиш
                </TabsTrigger>
              </TabsList>

              {/* LOGIN FORM */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="info@example.com"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">
                      Парол
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#c7a45a] hover:bg-[#b08e47] text-black font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Кутиш..." : "Кириш"}
                  </Button>
                </form>
              </TabsContent>

              {/* SIGNUP FORM */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-gray-300">
                      Тўлиқ исм
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Исмингиз"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="info@example.com"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-gray-300">
                      Телефон
                    </Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+998971181000"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-telegram" className="text-gray-300">
                      Telegram (@username)
                    </Label>
                    <Input
                      id="signup-telegram"
                      type="text"
                      placeholder="@username"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">
                      Парол
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#c7a45a] hover:bg-[#b08e47] text-black font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Кутиш..." : "Рўйхатдан ўтиш"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
