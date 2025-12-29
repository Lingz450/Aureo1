"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

const CreateCompanySchema = z.object({
  name: z.string().min(2).max(80),
  website: z.string().max(200).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export async function createCompanyWorkspace(input: z.infer<typeof CreateCompanySchema>) {
  const parsed = CreateCompanySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Please fill in the required fields." };

  const user = await getServerUser();
  if (!user) return { ok: false as const, error: "Sign in to create a company." };

  const supabase = await supabaseServer();

  // If already has a company, don't create duplicates.
  const { data: existingMembership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingMembership?.company_id) {
    return { ok: true as const, companyId: String(existingMembership.company_id) };
  }

  const baseSlug = slugify(parsed.data.name) || `company-${user.id.slice(0, 8)}`;

  // Ensure slug uniqueness.
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const { data: taken } = await supabase.from("companies").select("id").eq("slug", slug).maybeSingle();
    if (!taken) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: insertedCompany, error: insertCompanyError } = await supabase
    .from("companies")
    .insert({
      name: parsed.data.name,
      slug,
      website: parsed.data.website ?? null,
      location: parsed.data.location ?? null,
      description: parsed.data.description ?? null,
      created_by: user.id,
    } as any)
    .select("id, slug")
    .single();

  if (insertCompanyError || !insertedCompany) {
    return { ok: false as const, error: "Could not create company workspace. Check your permissions." };
  }

  // Add creator as owner member
  const { error: memberError } = await supabase.from("company_members").insert({
    company_id: insertedCompany.id,
    user_id: user.id,
    member_role: "owner",
  } as any);

  if (memberError) {
    return { ok: false as const, error: "Company created but could not assign membership. Apply migration 0008." };
  }

  return { ok: true as const, companyId: String(insertedCompany.id), slug: String(insertedCompany.slug) };
}







