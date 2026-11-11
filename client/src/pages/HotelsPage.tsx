import React, { useEffect, useState } from 'react';
import { MapPin, Star, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { CanonicalEntity } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const HotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<CanonicalEntity[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await inventoryService.getCanonicalEntities({ category: 'HOTEL' });
        setHotels(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHotels();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Canonical Hotels</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Consolidated hotel properties with normalized room categories and multi-supplier rates.
        </p>
      </div>

      <div className="space-y-4">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="hover:border-slate-300 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{hotel.name}</h2>
                  {hotel.starRating && (
                    <span className="flex items-center text-amber-500 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500 mr-0.5" />
                      {Number(hotel.starRating).toFixed(1)}
                    </span>
                  )}
                  <Badge status="HOTEL" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{hotel.address || `${hotel.destinationCity}, ${hotel.destinationCountry}`}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{hotel.description}</p>
              </div>

              {/* Linked Suppliers pill & Actions */}
              <div className="flex items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-900 block">
                    {hotel.totalSuppliers ?? 0} Matched Suppliers
                  </span>
                  <span className="text-[11px] text-teal-700">
                    {hotel.totalVariants ?? 0} Room Categories
                  </span>
                </div>

                <Link
                  to={`/offers?entityId=${hotel.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#0B192C] hover:bg-[#1E293B] rounded-md shadow-sm transition-colors"
                >
                  <span>Compare Offers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Inbound Supplier Feeds Preview */}
            {hotel.supplierListings && hotel.supplierListings.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 px-5 py-3 rounded-b-lg">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                  Consolidated Supplier Feeds
                </span>
                <div className="flex flex-wrap gap-2">
                  {hotel.supplierListings.map((sl: any) => (
                    <div
                      key={sl.id}
                      className="bg-white border border-slate-200 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-teal-600" />
                      <span className="font-medium text-slate-800">{sl.supplier?.name}:</span>
                      <span className="text-slate-500 italic">"{sl.rawName}"</span>
                      <span className="text-[10px] text-teal-700 font-mono">
                        ({(Number(sl.matchConfidence) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
