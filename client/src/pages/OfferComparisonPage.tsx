import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  Check,
  X,
  Coffee,
  Car,
  Clock,
  Sparkles,
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { api } from '../services/api';
import { CanonicalEntity, ComparisonOffer } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const OfferComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const entityIdFromQuery = searchParams.get('entityId');

  const [entities, setEntities] = useState<CanonicalEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(entityIdFromQuery || '');
  const [comparisonData, setComparisonData] = useState<{
    entity: Partial<CanonicalEntity>;
    offers: ComparisonOffer[];
  } | null>(null);
  const [, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingSuccessMsg, setRankingSuccessMsg] = useState('');

  // Load canonical entities list
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await inventoryService.getCanonicalEntities();
        setEntities(res.data);
        if (!selectedEntityId && res.data.length > 0) {
          setSelectedEntityId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEntities();
  }, []);

  // Load offer comparison for selected entity
  const loadComparison = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setRankingSuccessMsg('');
    try {
      const data = await inventoryService.getOfferComparison(id);
      setComparisonData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEntityId) {
      loadComparison(selectedEntityId);
    }
  }, [selectedEntityId]);

  const handleRankOffers = async () => {
    if (!selectedEntityId) return;
    setRankingLoading(true);
    setRankingSuccessMsg('');
    try {
      const res = await api.post('/offers/rank', {
        canonicalEntityId: selectedEntityId,
      });
      setRankingSuccessMsg(
        `Multi-criteria algorithm evaluated ${res.data.data.total_offers_evaluated} offers across Price (40%), Reliability (25%), Cancellation (20%), and Inclusions (15%).`
      );
      loadComparison(selectedEntityId);
    } catch (err: any) {
      setRankingSuccessMsg(err.response?.data?.message || 'Ranking failed');
    } finally {
      setRankingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Offer Intelligence Matrix</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized price, availability, cancellation policy and supplier reliability comparison.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-2xs"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.destinationCity})
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="secondary"
            disabled={rankingLoading || !comparisonData?.offers?.length}
            onClick={handleRankOffers}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>{rankingLoading ? 'Evaluating...' : 'Re-Rank Offers with AI'}</span>
          </Button>
        </div>
      </div>

      {rankingSuccessMsg && (
        <div className="p-3 rounded bg-teal-50 border border-teal-200 text-xs text-teal-800 font-medium">
          {rankingSuccessMsg}
        </div>
      )}

      {/* Comparison Grid */}
      {comparisonData && comparisonData.offers && comparisonData.offers.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {comparisonData.offers.map((offer) => {
              const isBestRank = offer.currentRank === 1;
              return (
                <Card
                  key={offer.offerId}
                  className={`relative flex flex-col justify-between ${
                    isBestRank ? 'ring-2 ring-teal-500 bg-white shadow-md' : 'bg-white'
                  }`}
                >
                  {isBestRank && (
                    <div className="absolute -top-3 left-4 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Award className="w-3 h-3" />
                      <span>Best Sangam Recommendation</span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mt-1">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {offer.supplierCode}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{offer.supplierName}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-slate-900 block leading-tight">
                          ${offer.netPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          + ${offer.taxAmount.toFixed(2)} tax / fees
                        </span>
                      </div>
                    </div>

                    {/* Room / Experience Variant */}
                    <div className="mt-4 p-2.5 rounded bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Supplier Variant Listing
                      </span>
                      <p className="font-semibold text-slate-800">{offer.supplierVariantName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Matched to: <strong>{offer.variantName}</strong>
                      </p>
                    </div>

                    {/* Policies Matrix */}
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          Supplier Trust:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {(offer.supplierReliability * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Cancellation:
                        </span>
                        <span
                          className={`font-medium ${
                            offer.cancellationPolicy?.refundable
                              ? 'text-teal-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {offer.cancellationPolicy?.refundable
                            ? `Free up to ${offer.cancellationPolicy.deadline_hours ?? 24}h`
                            : 'Non-refundable'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5 text-slate-400" />
                          Meal Plan:
                        </span>
                        <span className="font-medium text-slate-800">
                          {offer.mealPlan || 'None'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-slate-400" />
                          Transfers:
                        </span>
                        <span className="font-medium text-slate-800">
                          {offer.transferIncluded ? (
                            <span className="text-teal-700 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Included
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <X className="w-3 h-3" /> Not Included
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Inclusions tags */}
                    {offer.inclusions && offer.inclusions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {offer.inclusions.map((inc, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            {inc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Score Pill */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Rank Position: <strong>#{offer.currentRank || '—'}</strong>
                    </span>
                    <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Score: {offer.overallScore ? (offer.overallScore * 100).toFixed(1) : '—'}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="py-12 text-center">
          <p className="text-slate-500 text-sm">No live offers currently matched to this canonical entity.</p>
        </Card>
      )}
    </div>
  );
};
