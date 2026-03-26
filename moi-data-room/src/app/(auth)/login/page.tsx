import { redirect } from "next/navigation";

/** Login removed: redirect to data room. */
export default function LoginPage() {
  redirect("/home");
}
