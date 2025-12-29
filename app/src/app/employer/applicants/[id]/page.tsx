import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerApplicantPage({ params }: { params: { id: string } }) {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id,status,created_at,notes,jobs:job_id(id,title,company_id),profiles:user_id(full_name,email,headline,location,cv_url)",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader
          title="Application not found"
          description="This application either does not exist or you don’t have access."
          actions={
            <Button asChild>
              <Link href="/employer/applicants">Back to applicants</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const jobId = String((data as any)?.jobs?.id ?? "");
  const jobTitle = String((data as any)?.jobs?.title ?? "Job");
  const status = String((data as any)?.status ?? "applied");
  const createdAt = String((data as any)?.created_at ?? new Date().toISOString());
  const notes = typeof (data as any)?.notes === "string" ? (data as any).notes : "";

  const profile = (data as any)?.profiles ?? null;
  const name = String(profile?.full_name ?? "Candidate");
  const email = String(profile?.email ?? "");
  const headline = profile?.headline ? String(profile.headline) : "";
  const location = profile?.location ? String(profile.location) : "";
  const cvUrl = profile?.cv_url ? String(profile.cv_url) : "";

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title={name}
        description={headline || "Application details"}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {status}
            </Badge>
            <Badge variant="outline">{new Date(createdAt).toLocaleDateString()}</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/employer/applicants">Back</Link>
            </Button>
            {jobId ? (
              <Button asChild>
                <Link href={`/dashboard/employer/jobs/${jobId}`}>Open pipeline</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Candidate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{location || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CV</p>
              {cvUrl ? (
                <a className="font-medium underline" href={cvUrl} target="_blank" rel="noreferrer">
                  Open CV
                </a>
              ) : (
                <p className="font-medium">—</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{jobTitle}</p>
              {jobId ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/jobs/${jobId}`}>View public job page</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {notes ? notes : "No notes saved yet. Update notes from the pipeline view."}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}




