"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchListing } from "../../../lib/listings";

export default function ListingDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { data: listing } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id),
    enabled: !!id,
  });

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
      <p className="text-xl">{listing.price} ₺</p>
    </div>
  );
}
