"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchListings } from "../../lib/listings";

export default function ListingsPage() {
  const { data: listings } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
  });

  if (!listings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {listings.map((listing) => (
        <a
          key={listing.id}
          href={`/listings/${listing.id}`}
          className="border p-4 rounded hover:shadow"
        >
          <h2 className="font-bold">{listing.title}</h2>
          <p>{listing.price} ₺</p>
        </a>
      ))}
    </div>
  );
}
