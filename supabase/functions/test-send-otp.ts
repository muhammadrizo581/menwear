// File: test-send-otp-direct.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE_KEY";
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const phone = "+998901234567";
const telegram_username = "@yourusername";
const otp = Math.floor(100000 + Math.random() * 900000).toString();

const { error } = await supabase.from("otps").insert([{ phone, telegram_username, code: otp }]);
if (error) console.error("❌ OTP saqlanmadi:", error);
else console.log("✅ OTP saqlandi:", otp);

const text = `🔐 Sizning OTP kodingiz: *${otp}* (5 daqiqa amal qiladi)`;
const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: telegram_username, text, parse_mode: "Markdown" }),
});

console.log("📨 Telegram javobi:", await res.text());
