/** The admin area is its own full-screen shell, like the MastApps. */
export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Individual MastApps (/mastapps/<app>/...) and the admin area open full screen; the MastApps overview itself stays inside the website. */
export function isFullScreenAppPath(pathname: string): boolean {
  return pathname.startsWith("/mastapps/") || isAdminPath(pathname);
}

/** The app slug in /mastapps/<slug>/..., or null. */
export function appSlug(pathname: string): string | null {
  return pathname.startsWith("/mastapps/") ? (pathname.split("/")[2] ?? null) : null;
}
