import { redirect } from "next/navigation";

/** The action list lives on the minutes dashboard now; this keeps old links working. */
export default function ActionsPage() {
  redirect("/mastapps/minutes?actions=committee");
}
