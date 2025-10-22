// File: supabase/functions/send-otp/index.ts

// ✅ Deno HTTP kutubxonasini to‘g‘ri import qilish
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// ✅ Deno uchun `Supabase client` importi
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Telegramga OTP yuborish uchun fetch ishlatamiz
serve(async (req) => {
  try {
    const { phone, telegram_username } = await req.json();

    if (!phone || !telegram_username) {
      return new Response(
        JSON.stringify({ error: "Phone yoki Telegram username yo‘q" }),
        { status: 400 }
      );
    }

    // .env ichidan maxfiy qiymatlarni olish
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 6 xonali random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP’ni `otps` jadvaliga saqlaymiz
    const { error: insertError } = await supabase
      .from("otps")
      .insert([{ phone, telegram_username, code: otp }]);

    if (insertError) {
      console.error(insertError);
      return new Response(
        JSON.stringify({ error: "OTP saqlashda xato" }),
        { status: 500 }
      );
    }

    // Telegram bot orqali yuborish
    const text = `🔐 Sizning OTP kodingiz: *${otp}* (5 daqiqa amal qiladi)`;
    const sendUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramRes = await fetch(sendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegram_username,
        text,
        parse_mode: "Markdown",
      }),
    });

    const result = await telegramRes.json();

    if (!telegramRes.ok) {
      console.error(result);
      return new Response(
        JSON.stringify({ error: "Telegram orqali yuborilmadi" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP yuborildi" }),
      { status: 200 }
    );
  }
  catch (err: unknown) {
  console.error("Xatolik:", err);

  let details = "Noma'lum xato";

  if (err instanceof Error) {
    details = err.message;
  } else if (typeof err === "string") {
    details = err;
  }

  return new Response(
    JSON.stringify({ error: "Server xatosi", details }),
    { status: 500 }
  );
}

});
