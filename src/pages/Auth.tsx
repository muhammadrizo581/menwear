// src/pages/Auth.tsx
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

  // login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [tgUsername, setTgUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // tabs
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // === LOGIN ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!loginEmail || !loginPassword) {
        toast.error("Email ва паролни киритинг");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast.success("Муваффақиятли кирдингиз ✅");
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err?.message || "Киришда хатолик");
    } finally {
      setLoading(false);
    }
  };

  // === SIGNUP ===
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !tgUsername || !signupEmail || !signupPassword) {
      toast.error("Барча маълумотларни тўлдиринг");
      return;
    }

    setLoading(true);
    try {
      // create user with email & password
      const {
        data: signUpData,
        error: signUpError,
      } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        // optional: you can add user_metadata here:
        // options: { data: { full_name: fullName, phone, tg_username: tgUsername } }
      });

      if (signUpError) throw signUpError;

      const user = signUpData.user ?? (signUpData as any).user;

      // If user created, insert profile row (use upsert to cover re-runs)
      if (user) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          [
            {
              id: user.id,
              full_name: fullName,
              phone,
              telegram_username: tgUsername,
              email: signupEmail,
            },
          ],
          { onConflict: "id" }
        );

        if (profileError) {
          // If profile insertion fails, log & continue (or throw based on your policy)
          console.error("Profile error:", profileError);
          throw profileError;
        }
      }

      // Auto sign in after signup (some Supabase configs require email confirmation — in that case signIn will return accordingly)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      });
      if (signInError) {
        // Not fatal — user may need to confirm email; still inform user
        console.warn("Auto sign-in error:", signInError);
        toast.success("Рўйхатдан ўтилди — электрон почтага тасдиқ юборилган бўлиши мумкин.");
        navigate("/");
      } else {
        toast.success("Рўйхатдан муваффақиятли ўтдингиз ✅");
        navigate("/");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(err?.message || "Рўйхатдан ўтишда хатолик");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-black text-gray-100 px-4 py-10">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <img
            src="/logo.jpeg"
            alt="Menwear Logo"
            className="h-16 w-auto mb-3 rounded-full"
          />
          <h1 className="text-3xl font-semibold text-white">Menwear.uz</h1>
          <p className="text-sm text-zinc-400">Эркаклар кийимида янги стандарт</p>
        </motion.div>

        <Card className="w-full max-w-md bg-[#111] border border-zinc-800 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold text-white">
              Хуш келибсиз
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" onValueChange={(v) => setActiveTab(v as any)}>
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

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      placeholder="info@example.com"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Парол</Label>
                    <Input
                      type="password"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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

              {/* SIGNUP */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Тўлиқ исм</Label>
                    <Input
                      type="text"
                      placeholder="Исмингиз"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Телефон рақам</Label>
                    <Input
                      type="tel"
                      placeholder="+998901234567"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Telegram (@username)</Label>
                    <Input
                      type="text"
                      placeholder="@username"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={tgUsername}
                      onChange={(e) => setTgUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      placeholder="info@example.com"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Парол</Label>
                    <Input
                      type="password"
                      className="bg-zinc-800 border-zinc-700 text-gray-100"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#c7a45a] hover:bg-[#b08e47] text-black font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Юкланмоқда..." : "Рўйхатдан ўтиш"}
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
