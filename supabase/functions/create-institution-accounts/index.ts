import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function nameToEmail(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    + '@nexabridge.edu';
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get institutions without managed_by
    const { data: institutions, error: fetchErr } = await supabase
      .from("institutions")
      .select("id, name")
      .is("managed_by", null);

    if (fetchErr) throw fetchErr;
    if (!institutions || institutions.length === 0) {
      return new Response(JSON.stringify({ message: "No unmanaged institutions found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];
    const password = "8090556716";

    for (const inst of institutions) {
      const email = nameToEmail(inst.name);

      // Create user
      const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: inst.name,
          role: "institution",
          institution_name: inst.name,
        },
      });

      if (createErr) {
        results.push({ institution: inst.name, email, error: createErr.message });
        continue;
      }

      const userId = userData.user.id;

      // Update institution managed_by
      await supabase.from("institutions").update({ managed_by: userId }).eq("id", inst.id);

      // Ensure role exists
      await supabase.from("user_roles").upsert(
        { user_id: userId, role: "institution" },
        { onConflict: "user_id,role" }
      );

      // Update profile
      await supabase.from("profiles").upsert(
        { user_id: userId, full_name: inst.name, company: inst.name },
        { onConflict: "user_id" }
      );

      results.push({ institution: inst.name, email, userId, status: "created" });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
