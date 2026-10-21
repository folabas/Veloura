import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap result">
      <p className="label muted">Page not found</p>
      <h1>
        This page has <em>moved on</em>
      </h1>
      <p className="muted">The piece or page you&apos;re looking for isn&apos;t here any more.</p>
      <Link className="btn btn-line label" href="/shop">
        Go to the shop
      </Link>
    </div>
  );
}
