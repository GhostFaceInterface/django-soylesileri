import api from "./api";

export interface Listing {
  id: number;
  title: string;
  price: string;
}

export async function fetchListings() {
  const res = await api.get<Listing[]>("listings/");
  return res.data;
}

export async function fetchListing(id: string) {
  const res = await api.get<Listing>(`listings/${id}/`);
  return res.data;
}
