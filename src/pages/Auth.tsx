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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // === LOGIN ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Муваффақиятли кирдингиз ✅");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Киришда хато");
    } finally {
      setLoading(false);
    }
  };

  // === SEND OTP ===
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !telegramUsername) {
      toast.error("Телефон ва Telegram username киритинг");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, telegram_username: telegramUsername }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OTP юборишда хато");

      toast.success("OTP код Telegram орқали юборилди!");
      setOtpSent(true);
    } catch (error: any) {
      toast.error(error.message || "Хатолик юз берди");
    } finally {
      setLoading(false);
    }
  };

  // === VERIFY OTP ===
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("6 рақамли кодни киритинг");
      return;
    }
    if (!email || !password || !fullName) {
      toast.error("Барча маълумотларни тўлдиринг");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            code: otpCode,
            email,
            password,
            full_name: fullName,
            telegram_username: telegramUsername,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Тасдиқлашда хато");

      toast.success("Рўйхатдан муваффақиятли ўтдингиз ✅");
      await supabase.auth.signInWithPassword({ email, password });
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Хатолик юз берди");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-black text-gray-100 px-4 py-10">
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <img
            src="/logo.jpeg"
            alt="Menwear Logo"
            className="h-16 w-auto mb-3 drop-shadow-lg rounded-full"
          />
          <h1 className="text-3xl font-semibold text-white">Menwear.uz</h1>
          <p className="text-sm text-zinc-400">Эркаклар кийимида янги стандарт</p>
        </motion.div>

        {/* CARD */}
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
                  <div>
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

                  <div>
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
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-phone" className="text-gray-300">
                        Телефон рақам
                      </Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+998901234567"
                        className="bg-zinc-800 border-zinc-700 text-gray-100"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
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
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Ботга /start босган бўлишингиз керак
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#c7a45a] hover:bg-[#b08e47] text-black font-semibold"
                      disabled={loading}
                    >
                      {loading ? "Юборилмоқда..." : "OTP кодни олиш"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
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

                    <div>
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

                    <div>
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

                    <div>
                      <Label className="text-gray-300">OTP Код</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otpCode}
                          onChange={(value) => setOtpCode(value)}
                        >
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-zinc-700 text-gray-300"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                        }}
                        disabled={loading}
                      >
                        Орқага
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#c7a45a] hover:bg-[#b08e47] text-black font-semibold"
                        disabled={loading}
                      >
                        {loading ? "Текширилмоқда..." : "Тасдиқлаш"}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
