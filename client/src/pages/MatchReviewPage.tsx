import React, { useEffect, useState } from 'react';
import {
  GitCompare,
  CheckCircle,
  XCircle,
  Split,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { matchingService } from '../services/matchingService';
import { inventoryService } from '../services/inventoryService';
import { SupplierListing, CanonicalEntity } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const MatchReviewPage: React.FC = () => {
  const [pendingListings, setPendingListings] = useState<SupplierListing[]>([]);
  const [canonicalOptions, setCanonicalOptions] = useState<CanonicalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<SupplierListing | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadPending = async () => {
    setLoading(true);
    try {
      const [pending, canonicalRes] = await Promise.all([
        matchingService.getPendingReviews(),
        inventoryService.getCanonicalEntities(),
      ]);
      setPendingListings(pending);
      setCanonicalOptions(canonicalRes.data);
      if (pending.length > 0 && !selectedListing) {
        setSelectedListing(pending[0]);
        setSelectedTargetId(canonicalRes.data[0]?.id || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleDecision = async (decision: 'MANUAL_CONFIRM' | 'MANUAL_REJECT' | 'SPLIT') => {
    if (!selectedListing) return;
    setActionLoading(true);
    setActionMessage('');
    try {
      await matchingService.submitDecision({
        sourceListingId: selectedListing.id,
        targetCanonicalId: selectedTargetId || canonicalOptions[0]?.id,
        decision,
        explanation: {
          note: `Analyst human decision: ${decision}`,
        },
      });
      setActionMessage(`Decision '${decision}' successfully applied and logged to audit trail.`);
      loadPending();
    } catch (err: any) {
      setActionMessage(err.response?.data?.message || 'Failed to submit match decision.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerAI = async () => {
    if (!selectedListing) return;
    setActionLoading(true);
    try {
      const res = await matchingService.runMatching(selectedListing.id);
      if (res.data?.best_match) {
        setActionMessage(
          `AI Matching Engine evaluated: Best match is '${res.data.best_match.canonical_name}' with confidence ${(res.data.best_match.overall_confidence * 100).toFixed(1)}%.`
        );
        setSelectedTargetId(res.data.best_match.canonical_id);
      } else {
        setActionMessage('AI Matching Engine found no candidate above review threshold.');
      }
      loadPending();
    } catch (err: any) {
      setActionMessage(err.response?.data?.message || 'Matching engine error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Human-in-the-Loop Match Review
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve borderline duplicate candidates, inspect scoring breakdown, and confirm or split canonical clusters.
          </p>
        </div>
        <button
          onClick={loadPending}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue ({pendingListings.length})</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded bg-teal-50 border border-teal-200 text-xs text-teal-800 font-medium">
          {actionMessage}
        </div>
      )}

      {pendingListings.length === 0 ? (
        <Card className="py-12 text-center">
          <CheckCircle className="w-10 h-10 text-teal-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">Review Queue Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            All inbound supplier listings are either auto-matched or verified. No pending match reviews required.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Queue Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pending Candidates ({pendingListings.length})
            </h3>
            <div className="space-y-2">
              {pendingListings.map((item) => {
                const isSelected = selectedListing?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedListing(item)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/60 border-teal-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge status={item.category} />
                      <Badge status={item.matchStatus} />
                    </div>
                    <div className="font-semibold text-slate-900 truncate">{item.rawName}</div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                      <span>{item.city}, {item.country}</span>
                      <span className="font-mono text-teal-700">
                        {item.matchConfidence ? `${(Number(item.matchConfidence) * 100).toFixed(0)}%` : 'Review'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-Side Review Column */}
          <div className="lg:col-span-2 space-y-4">
            {selectedListing && (
              <Card>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-sm text-slate-900">Side-by-Side Verification</span>
                  </div>
                  <button
                    onClick={handleTriggerAI}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-300 rounded text-xs font-semibold hover:bg-teal-100"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Run AI Matching Engine</span>
                  </button>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Raw Supplier Inbound Record */}
                  <div className="p-4 rounded-lg bg-amber-50/30 border border-amber-200 text-xs space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                      Inbound Supplier Listing (Source)
                    </span>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Product Name:</span>
                      <p className="font-bold text-slate-900 text-sm">{selectedListing.rawName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Supplier:</span>
                      <p className="font-medium text-slate-800">
                        {selectedListing.supplier?.name} ({selectedListing.supplier?.code})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Address & City:</span>
                      <p className="text-slate-700">
                        {selectedListing.rawAddress || 'N/A'}, {selectedListing.city}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Raw Description:</span>
                      <p className="text-slate-600 text-[11px] line-clamp-3">
                        {selectedListing.rawDescription || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Target Canonical Entity */}
                  <div className="p-4 rounded-lg bg-teal-50/30 border border-teal-200 text-xs space-y-2">
                    <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                      Target Canonical Entity (Proposed Match)
                    </span>
                    <div>
                      <label className="text-slate-500 block text-[10px] mb-1 font-semibold">
                        Select Target Canonical Product:
                      </label>
                      <select
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium text-xs bg-white text-slate-900"
                      >
                        {canonicalOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.destinationCity})
                          </option>
                        ))}
                      </select>
                    </div>

                    {(() => {
                      const target = canonicalOptions.find((c) => c.id === selectedTargetId);
                      if (!target) return null;
                      return (
                        <div className="space-y-2 pt-2 border-t border-teal-200/50">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Master Name:</span>
                            <p className="font-bold text-teal-950 text-sm">{target.name}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Standardized Name:</span>
                            <p className="font-mono text-[11px] text-teal-800">{target.standardizedName}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">City:</span>
                            <p className="text-slate-700">{target.destinationCity}, {target.destinationCountry}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Important Safeguard Warning */}
                <div className="mt-4 p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Architectural Rule:</strong> Non-destructive deduplication. Confirming links this supplier listing to the canonical cluster. Rejecting marks it as unmatched. Splitting creates a distinct new canonical entity without modifying other records.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleDecision('MANUAL_REJECT')}
                    className="text-rose-700 border-rose-300 hover:bg-rose-50"
                  >
                    <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                    Reject Match
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleDecision('SPLIT')}
                  >
                    <Split className="w-4 h-4 mr-1.5" />
                    Split as New Canonical Product
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleDecision('MANUAL_CONFIRM')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5 text-teal-400" />
                    Confirm Canonical Match
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
