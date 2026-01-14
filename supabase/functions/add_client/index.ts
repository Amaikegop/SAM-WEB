// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/add_client' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
// supabase/functions/add_client/index.ts

// supabase/functions/add_client/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // En producción, usar dominio específico
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullname = formData.get("fullname") as string;
    const clientIdRaw = formData.get("client_id") as string;
    const client_id = parseInt(clientIdRaw);
    const pdfFile = formData.get("file") as File;

    if (!pdfFile) throw new Error("No se proporcionó un archivo PDF.");

    // const supabase = createClient(
    //   Deno.env.get("PROJECT_URL")!,
    //   Deno.env.get("SERVICE_ROLE_KEY")!
    // );

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en los secrets."
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Subida del pdf al storage bucket
    const filePath = `client/${client_id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("clients_docs")
      .upload(filePath, pdfFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicURLData } = supabase.storage
      .from("clients_docs")
      .getPublicUrl(filePath);

    const docUrl = publicURLData.publicUrl;

    // Crear usuario en Supabase Auth
    const { data: user, error: signUpError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "client_admin", client_id },
      });

    if (signUpError) throw signUpError;

    // Insertar en la tabla client
    const { error: insertClientError } = await supabase.from("client").insert([
      {
        id: client_id,
        fullname,
        doc: docUrl,
        active: true,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertClientError) throw insertClientError;

    const { user: createdUser } = user;

    const { error: insertProfilesError } = await supabase
      .from("profiles")
      .insert([{ id: createdUser.id, client_id, role: "client_admin", email }]);

    if (insertProfilesError) throw insertProfilesError;

    const transporter = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST"),
      port: Number(Deno.env.get("SMTP_PORT")),
      secure: Number(Deno.env.get("SMTP_PORT")) === 465,
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
    });

    const mailOptions = {
      from: Deno.env.get("FROM_EMAIL"),
      to: email,
      subject: "Tus credenciales de acceso a SAM",
      html: `
        <h3>Hola ${fullname} 👋</h3>
        <p>Tu cuenta ha sido creada exitosamente en <b>SAM</b>.</p>
        <p><b>Usuario:</b> ${email}</p>
        <p><b>Contraseña:</b> ${password}</p>
        <p>Podés ingresar desde <a href="https://sam-web-login.vercel.app/login.html">este enlace</a>.</p>
        <br>
        <p>— El equipo de SAM 🚀</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cliente creado y correo enviado.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error en add_client:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
