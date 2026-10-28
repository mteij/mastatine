/** Individual MastApps (/mastapps/<app>/...) open full screen; the MastApps overview itself stays inside the website. */
export function isFullScreenAppPath(pathname: string): boolean {
  return pathname.startsWith("/mastapps/");
}

/** The app slug in /mastapps/<slug>/..., or null. */
export function appSlug(pathname: string): string | null {
  return isFullScreenAppPath(pathname) ? (pathname.split("/")[2] ?? null) : null;
}
