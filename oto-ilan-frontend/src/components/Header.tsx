import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b p-4 flex justify-between">
      <Link href="/" className="font-bold">
        Oto İlan
      </Link>
      <nav className="flex gap-4">
        <Link href="/listings">İlanlar</Link>
        <Link href="/login">Giriş</Link>
      </nav>
    </header>
  );
}
