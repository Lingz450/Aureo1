import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      return NextResponse.json({ ok: true, user: null });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email ?? null,
        role: (user.user_metadata?.role as string | undefined) ?? null,
        fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}







