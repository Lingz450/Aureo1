"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCompanyWorkspace } from "./company-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function CompanySetup() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [description, setDescription] = React.useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your company workspace</CardTitle>
        <p className="text-sm text-muted-foreground">
          You need a workspace before posting jobs. This creates your company profile and makes you the owner.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            createCompanyWorkspace({
              name,
              website: website.trim() || null,
              location: location.trim() || null,
              description: description.trim() || null,
            })
              .then((res) => {
                if (!res.ok) {
                  toast.error(res.error || "Could not create company.");
                  return;
                }
                toast.success("Company workspace created.");
                router.refresh();
                router.push("/dashboard/employer");
              })
              .finally(() => setLoading(false));
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aureo Labs"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Website (optional)</Label>
              <Input
                id="company-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-location">Location (optional)</Label>
            <Input
              id="company-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote / Lagos"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-description">Description (optional)</Label>
            <Textarea
              id="company-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your company do?"
              rows={4}
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || name.trim().length < 2}>
            {loading ? "Creating..." : "Create company"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}







