import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/session";
import { banUser, removeUser, setUserRole, unbanUser } from "../actions";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: Date;
}

export default async function AdminUsers() {
  const { user: me } = await requireAdmin();
  const users = await sql<UserRow[]>`
    SELECT id, name, email, role, banned, "createdAt" FROM "user" ORDER BY "createdAt" DESC LIMIT 500
  `;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>User</th><th>Role</th><th>Joined</th><th><span className="sr-only">Actions</span></th></tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isMe = u.id === me.id;
            return (
              <tr key={u.id}>
                <td>
                  <p className="font-medium">{u.name || "—"}{isMe && <span className="badge ml-2">You</span>}</p>
                  <p className="text-sm text-muted">{u.email}</p>
                </td>
                <td>
                  <span className={u.role === "admin" ? "badge" : "text-muted"}>{u.role}</span>
                  {u.banned && <span className="ml-2 text-sm font-semibold text-danger">banned</span>}
                </td>
                <td className="whitespace-nowrap text-muted">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                <td>
                  {!isMe && (
                    <div className="flex flex-wrap justify-end gap-2">
                      <form action={setUserRole}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="role" value={u.role === "admin" ? "user" : "admin"} />
                        <button className="btn btn-secondary btn-sm" type="submit">{u.role === "admin" ? "Remove admin" : "Make admin"}</button>
                      </form>
                      <form action={u.banned ? unbanUser : banUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <ConfirmButton message={u.banned ? "Lift this ban?" : `Ban ${u.email}? They will be signed out and unable to sign in.`} className="btn btn-secondary btn-sm">
                          {u.banned ? "Unban" : "Ban"}
                        </ConfirmButton>
                      </form>
                      <form action={removeUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <ConfirmButton message={`Permanently delete ${u.email}?`} className="btn btn-danger btn-sm">Delete</ConfirmButton>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
