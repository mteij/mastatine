/** The admin area is its own full-screen shell, like the MastApps. */
export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Individual MastApps (/mastapps/<app>/...) and the admin area open full screen; the MastApps overview itself stays inside the website. */
export function isFullScreenAppPath(pathname: string): boolean {
  return pathname.startsWith("/mastapps/") || isAdminPath(pathname);
}

const INFORMATION_PATHS = ["/about", "/board", "/committees", "/history", "/membership", "/news", "/contact"];

/** Pages that tell people about the association; the newsletter signup band only belongs here, not on account, login or tool pages. */
export function isInformationPath(pathname: string): boolean {
  return pathname === "/" || INFORMATION_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** The app slug in /mastapps/<slug>/..., or null. */
export function appSlug(pathname: string): string | null {
  return pathname.startsWith("/mastapps/") ? (pathname.split("/")[2] ?? null) : null;
}
