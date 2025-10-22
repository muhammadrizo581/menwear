// --- Importlar ---
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CORS sozlamalari ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Asosiy server ---
serve(async (req) => {
  // OPTIONS uchun CORS javobi
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JSON body olish
    const { phone, code, email, password, full_name, telegram_username } = await req.json();

    // Maydonlar tekshiruvi
    if (!phone || !code || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Barcha maydonlar to‘ldirilishi kerak" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Supabase client yaratish
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // OTP kodni tekshirish
    const { data: verification, error: verificationError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verificationError || !verification) {
      return new Response(
        JSON.stringify({ error: "Noto‘g‘ri yoki muddati o‘tgan kod" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Foydalanuvchini yaratish
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone, telegram_username },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: "Foydalanuvchi yaratishda xato: " + authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // OTP ni verified qilish
    await supabase
      .from("phone_verifications")
      .update({ verified: true })
      .eq("id", verification.id);

    // Muvaffaqiyatli javob
    return new Response(
      JSON.stringify({
        success: true,
        message: "Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi!",
        user: authData?.user,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {    
    const errorMessage = err instanceof Error ? err.message : "Xatolik yuz berdi";
    console.error("Error:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
