import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://msragultdkzceidrpfpp.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcmFndWx0ZGt6Y2VpZHJwZnBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA2NTg0MSwiZXhwIjoyMDc2NjQxODQxfQ.A9liRai20I3EWLsIk9q65q-efCi8Xi1TvwQ1iUjhKE4";
const TELEGRAM_BOT_TOKEN = "8365126877:AAH7fVx8NLeJVuAA3yxncaGJykpf2t-F0pw";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, telegram_username } = await req.json();

    if (!phone || !telegram_username) {
      return new Response(JSON.stringify({ error: "Telefon va Telegram username kerak" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 🟡 Username'dan @ belgini olib tashlaymiz
    const cleanUsername = telegram_username.replace("@", "");

    // 🟢 Foydalanuvchini Supabase'dan topamiz
    const { data: user, error: userError } = await supabase
      .from("telegram_users")
      .select("chat_id")
      .eq("username", cleanUsername)
      .single();

    if (userError || !user?.chat_id) {
      return new Response(JSON.stringify({ error: "Telegram foydalanuvchi topilmadi" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // 🟢 OTP yaratamiz
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🟢 OTP'ni saqlaymiz
    const { error: otpError } = await supabase
      .from("otp_codes")
      .insert([{ phone, otp, created_at: new Date().toISOString() }]);

    if (otpError) {
      console.error("DB error:", otpError);
      return new Response(JSON.stringify({ error: "OTP saqlashda xato" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 🟢 Telegram orqali yuboramiz
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user.chat_id,
        text: `🔐 Sizning OTP kodingiz: ${otp}`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Serverda xato" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
