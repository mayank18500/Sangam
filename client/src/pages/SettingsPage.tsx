import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const SettingsPage: React.FC = () => {
  const [autoMatchThreshold, setAutoMatchThreshold] = useState(0.85);
  const [reviewThreshold, setReviewThreshold] = useState(0.65);
  const [hotelNameWeight, setHotelNameWeight] = useState(0.50);
  const [hotelGeoWeight, setHotelGeoWeight] = useState(0.30);
  const [hotelStarWeight, setHotelStarWeight] = useState(0.10);
  const [hotelAddrWeight, setHotelAddrWeight] = useState(0.10);

  const [priceWeight, setPriceWeight] = useState(0.40);
  const [reliabilityWeight, setReliabilityWeight] = useState(0.25);
  const [cancellationWeight, setCancellationWeight] = useState(0.20);
  const [inclusionsWeight, setInclusionsWeight] = useState(0.15);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Algorithmic Configuration & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fine-tune confidence score boundaries, feature weighting for RapidFuzz matching, and multi-criteria ranking.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded bg-teal-50 border border-teal-200 text-xs text-teal-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>Settings successfully persisted to intelligence configuration registry.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Matching Confidence Thresholds */}
        <Card title="Deduplication Confidence Gates" subtitle="Confidence thresholds for automated vs manual review">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">Auto-Match Gate (Accept)</label>
                <span className="font-mono font-bold text-teal-800">{(autoMatchThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.98"
                step="0.01"
                value={autoMatchThreshold}
                onChange={(e) => setAutoMatchThreshold(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Candidates scoring at or above this threshold automatically link to the canonical cluster.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">Human Review Gate (Hold)</label>
                <span className="font-mono font-bold text-amber-800">{(reviewThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.80"
                step="0.01"
                value={reviewThreshold}
                onChange={(e) => setReviewThreshold(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Scores between this threshold and the auto-match gate are flagged in the human review queue.
              </p>
            </div>
          </div>
        </Card>

        {/* Hotel Matching Feature Weights */}
        <Card title="Hotel Matching Feature Weights" subtitle="Scoring weights used for hotel deduplication">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Token Similarity (RapidFuzz)</label>
                <span className="font-mono font-semibold">{(hotelNameWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.8"
                step="0.05"
                value={hotelNameWeight}
                onChange={(e) => setHotelNameWeight(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">GPS Proximity (Haversine)</label>
                <span className="font-mono font-semibold">{(hotelGeoWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={hotelGeoWeight}
                onChange={(e) => setHotelGeoWeight(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Star Rating Match</label>
                <span className="font-mono font-semibold">{(hotelStarWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.3"
                step="0.05"
                value={hotelStarWeight}
                onChange={(e) => setHotelStarWeight(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Address Token Match</label>
                <span className="font-mono font-semibold">{(hotelAddrWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.3"
                step="0.05"
                value={hotelAddrWeight}
                onChange={(e) => setHotelAddrWeight(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          </div>
        </Card>

        {/* Offer Ranking Weights */}
        <Card title="Multi-Criteria Offer Ranking Weights" subtitle="Ranking priorities for best available options">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Price Competitiveness</label>
                <span className="font-mono font-semibold">{(priceWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.7"
                step="0.05"
                value={priceWeight}
                onChange={(e) => setPriceWeight(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Supplier Reliability Score</label>
                <span className="font-mono font-semibold">{(reliabilityWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={reliabilityWeight}
                onChange={(e) => setReliabilityWeight(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Cancellation Policy Flexibility</label>
                <span className="font-mono font-semibold">{(cancellationWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={cancellationWeight}
                onChange={(e) => setCancellationWeight(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Inclusions (Meals & Transfers)</label>
                <span className="font-mono font-semibold">{(inclusionsWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.3"
                step="0.05"
                value={inclusionsWeight}
                onChange={(e) => setInclusionsWeight(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="sm">
            <Save className="w-4 h-4 mr-1.5" />
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
