import { redirect } from "next/navigation";

export default function EmployerJobPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/employer/jobs/${params.id}`);
}




