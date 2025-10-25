import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://msragultdkzceidrpfpp.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcmFndWx0ZGt6Y2VpZHJwZnBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA2NTg0MSwiZXhwIjoyMDc2NjQxODQxfQ.A9liRai20I3EWLsIk9q65q-efCi8Xi1TvwQ1iUjhKE4"; // shu yerga ham yozasan

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: "Telefon yoki kod yo‘q" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("otp", otp)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, message: "Kod noto‘g‘ri" }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Kod tasdiqlandi" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Serverda xato" }), {
      status: 500,
    });
  }
});
