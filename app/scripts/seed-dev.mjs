/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EMPLOYER_EMAIL = process.env.SEED_EMPLOYER_EMAIL ?? "employer@example.com";
const SEEKER_EMAIL = process.env.SEED_SEEKER_EMAIL ?? "seeker@example.com";
const PASSWORD = process.env.SEED_PASSWORD ?? "Password123!";

async function ensureUser({ email, role, fullName }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role, full_name: fullName },
  });

  if (data?.user) return data.user;

  const msg = String(error?.message ?? "");
  if (!msg.toLowerCase().includes("already")) {
    throw new Error(`Failed creating user ${email}: ${msg || "unknown error"}`);
  }

  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw new Error(`Failed listing users: ${listError.message}`);

  const existing = (listed?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
  if (!existing) throw new Error(`User exists but could not be found by listUsers: ${email}`);
  return existing;
}

async function main() {
  console.log("Seeding dev data…");

  const employerUser = await ensureUser({
    email: EMPLOYER_EMAIL,
    role: "employer",
    fullName: "Northwind Hiring Team",
  });

  const seekerUser = await ensureUser({
    email: SEEKER_EMAIL,
    role: "seeker",
    fullName: "Aureo Seeker",
  });

  // Profiles
  await supabase.from("profiles").upsert([
    {
      id: employerUser.id,
      email: employerUser.email,
      role: "employer",
      full_name: employerUser.user_metadata?.full_name ?? "Northwind Hiring Team",
      headline: "Hiring for calm, high-signal teams",
      location: "Remote",
      is_public: false,
    },
    {
      id: seekerUser.id,
      email: seekerUser.email,
      role: "seeker",
      full_name: seekerUser.user_metadata?.full_name ?? "Aureo Seeker",
      headline: "Product-minded engineer",
      location: "Remote",
      skills: ["TypeScript", "React", "Postgres"],
      links: { portfolio: "https://example.com" },
      is_public: true,
    },
  ]);

  // Company
  const { data: companyRow, error: companyErr } = await supabase
    .from("companies")
    .upsert(
      {
        slug: "northwind",
        name: "Northwind",
        website: "https://example.com",
        location: "Remote",
        description: "A sample company for development.",
        verified: true,
        response_rate: 92,
        flagged_count: 0,
        created_by: employerUser.id,
      },
      { onConflict: "slug" },
    )
    .select("id,slug")
    .single();
  if (companyErr) throw new Error(`Company upsert failed: ${companyErr.message}`);

  const companyId = companyRow.id;

  await supabase.from("company_members").upsert(
    { company_id: companyId, user_id: employerUser.id, member_role: "owner" },
    { onConflict: "company_id,user_id" },
  );

  // Jobs (ensure by title)
  const jobTemplates = [
    {
      title: "Senior Frontend Engineer",
      description: "Build calm UI systems with great performance and reliability.",
      requirements: "React, TypeScript, Testing",
      employment_type: "Full-time",
      location: "Remote",
      remote: true,
      salary_min: 120000,
      salary_max: 160000,
      currency: "USD",
      is_active: true,
    },
    {
      title: "Product Designer",
      description: "Design workflows that reduce anxiety for candidates and teams.",
      requirements: "Systems thinking, strong writing, shipped work",
      employment_type: "Full-time",
      location: "Remote",
      remote: true,
      salary_min: 110000,
      salary_max: 150000,
      currency: "USD",
      is_active: true,
    },
    {
      title: "Recruiting Operations",
      description: "Keep hiring pipelines clean and candidates informed.",
      requirements: "Process design, stakeholder management",
      employment_type: "Contract",
      location: "Remote",
      remote: true,
      salary_min: 70000,
      salary_max: 90000,
      currency: "USD",
      is_active: true,
    },
  ];

  const { data: existingJobs } = await supabase
    .from("jobs")
    .select("id,title")
    .eq("company_id", companyId);

  const existingByTitle = new Map((existingJobs ?? []).map((j) => [String(j.title), String(j.id)]));

  const createdJobIds = [];
  for (const t of jobTemplates) {
    const existingId = existingByTitle.get(t.title);
    if (existingId) {
      createdJobIds.push(existingId);
      continue;
    }
    const { data: inserted, error } = await supabase
      .from("jobs")
      .insert({
        ...t,
        company_id: companyId,
        created_by: employerUser.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(`Job insert failed: ${error.message}`);
    createdJobIds.push(String(inserted.id));
  }

  const [jobA, jobB] = createdJobIds;

  // Application
  await supabase.from("applications").upsert(
    { job_id: jobA, user_id: seekerUser.id, status: "applied" },
    { onConflict: "job_id,user_id" },
  );

  // Saved job
  await supabase.from("saved_jobs").upsert(
    { user_id: seekerUser.id, job_id: jobB },
    { onConflict: "user_id,job_id" },
  );

  // Saved search
  const { data: savedSearch, error: savedSearchErr } = await supabase
    .from("saved_searches")
    .upsert(
      {
        user_id: seekerUser.id,
        name: "Remote roles",
        query: "remote",
        filters: { remote: true },
        schedule: { frequency: "daily" },
        delivery: { inbox: true, email: false },
        active: true,
      },
      { onConflict: "user_id,name" },
    )
    .select("id")
    .single();
  if (savedSearchErr) throw new Error(`Saved search upsert failed: ${savedSearchErr.message}`);

  // Digest (best-effort)
  await supabase.from("search_digests").insert({
    user_id: seekerUser.id,
    saved_search_id: savedSearch.id,
    summary_rows: [
      {
        jobId: jobA,
        title: jobTemplates[0].title,
        company: "Northwind",
        location: "Remote",
        url: `/jobs/${jobA}`,
        matchedSkills: ["TypeScript", "React"],
        matchScore: 72,
      },
    ],
  });

  // Notification
  await supabase.from("notifications").insert({
    user_id: seekerUser.id,
    type: "alert_match",
    title: "1 new job matches your saved search",
    body: `${jobTemplates[0].title} at Northwind`,
    data: { job_id: jobA },
  });

  console.log("Seed complete.");
  console.log(`Employer: ${EMPLOYER_EMAIL} / ${PASSWORD}`);
  console.log(`Seeker:   ${SEEKER_EMAIL} / ${PASSWORD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




