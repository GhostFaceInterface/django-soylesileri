import { use } from 'react';

interface Listing {
  id: number;
  title: string;
  price: string;
}

async function fetchListings() {
  const res = await fetch('http://localhost:8000/api/listings/');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default function Home() {
  const data: Listing[] = use(fetchListings());
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Listings</h1>
      <ul className="grid gap-4">
        {data.map((item) => (
          <li key={item.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p>{item.price} ₺</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
