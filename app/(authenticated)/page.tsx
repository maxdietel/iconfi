import { redirect } from 'next/navigation'

export default async function AuthenticatedPage() {
  redirect("/topics");
}