import Link from "next/link";

export default function NotFoundCard() {
  return (
    <div className="container-prose py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-accent-text">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">This mast does not exist</h1>
      <p className="mt-3 text-muted">The page you are looking for was never built, or fell over in a storm.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to the masts
      </Link>
    </div>
  );
}
