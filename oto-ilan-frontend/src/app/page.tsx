'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">Oto İlan Platformu</h1>
      <Link href="/listings" className="text-blue-500 underline">
        İlanları Görüntüle
      </Link>
    </div>
  );
}
