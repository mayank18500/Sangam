import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Layers } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { supplierService } from '../services/supplierService';
import { SupplierListing, Supplier } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const InventoryPage: React.FC = () => {
  const [listings, setListings] = useState<SupplierListing[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [matchStatus, setMatchStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, supRes] = await Promise.all([
        inventoryService.getRawListings({
          category: category || undefined,
          supplierId: supplierId || undefined,
          matchStatus: matchStatus || undefined,
          search: search || undefined,
        }),
        supplierService.getAll(),
      ]);
      setListings(invRes.data);
      setSuppliers(supRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, supplierId, matchStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Explorer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit raw inbound records from supplier feeds before and after canonical deduplication.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search raw product name, city or external ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
          >
            <option value="">All Verticals</option>
            <option value="HOTEL">Hotels</option>
            <option value="SIGHTSEEING">Sightseeing</option>
          </select>

          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>

          <select
            value={matchStatus}
            onChange={(e) => setMatchStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
          >
            <option value="">All Match States</option>
            <option value="AUTO_MATCHED">Auto Matched</option>
            <option value="MANUALLY_MATCHED">Manually Matched</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="UNMATCHED">Unmatched</option>
          </select>

          <button
            type="submit"
            className="px-3 py-1.5 text-xs bg-[#0B192C] text-white rounded-md hover:bg-[#1E293B]"
          >
            Apply
          </button>
        </form>
      </Card>

      {/* Listings Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Raw Product Name</th>
                <th className="px-4 py-3">Vertical</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Match Status</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Canonical Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No supplier listings found matching current filters.
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{item.rawName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.externalId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={item.category} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{item.supplier?.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.supplier?.code}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.city}, {item.country}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={item.matchStatus} />
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">
                      {item.matchConfidence ? `${(Number(item.matchConfidence) * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {item.canonicalEntity ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          <Layers className="w-3 h-3 text-teal-600" />
                          <span>{item.canonicalEntity.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
