import { fetchListing } from '../../../lib/listings';
interface Props { params: { id: string } }

export default async function ListingDetail({ params }: Props) {
  const listing = await fetchListing(params.id);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
      <p className="text-xl">{listing.price} ₺</p>
    </div>
  );
}
