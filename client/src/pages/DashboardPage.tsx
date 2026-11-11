import React, { useEffect, useState } from 'react';
import {
  Network,
  Database,
  Layers,
  AlertCircle,
  TrendingUp,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { analyticsService } from '../services/analyticsService';
import { AnalyticsOverview } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analyticsService.getOverview();
      setData(res);
    } catch (err: any) {
      setError('Failed to fetch analytics from backend API. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const metrics = data?.metrics || {
    totalSuppliers: 0,
    totalInventoryListings: 0,
    totalCanonicalEntities: 0,
    pendingMatchReviews: 0,
    autoMatchedCount: 0,
    manuallyMatchedCount: 0,
    deduplicationRatePercent: 0,
    consolidationRatio: '1:1',
  };

  const categoryChartData = data?.categoryDistribution.map((c) => ({
    name: c.category,
    Raw: c.rawListings,
    Canonical: c.canonicalEntities,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory Intelligence Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time deduplication, supplier overlap, and multi-channel consolidation metrics.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Suppliers */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Connected Suppliers</span>
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalSuppliers}</span>
            <span className="text-[11px] text-teal-700 font-medium">100% active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-source travel feed</p>
        </Card>

        {/* Total Inventory Listings */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Raw Inventory Listings</span>
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalInventoryListings}</span>
            <span className="text-[11px] text-slate-500 font-medium">Across all feeds</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hotels & Sightseeing combined</p>
        </Card>

        {/* Canonical Entities */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Canonical Entities</span>
            <div className="w-8 h-8 rounded bg-teal-50 flex items-center justify-center text-teal-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-900">{metrics.totalCanonicalEntities}</span>
            <span className="text-[11px] text-teal-700 font-medium">
              Ratio {metrics.consolidationRatio}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">De-duplicated master catalog</p>
        </Card>

        {/* Pending Match Reviews */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Reviews</span>
            <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900">{metrics.pendingMatchReviews}</span>
            <span className="text-[11px] text-amber-700 font-medium">
              Requires human sign-off
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Borderline confidence candidates</p>
        </Card>
      </div>

      {/* Intelligence Performance & Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0B192C] text-white rounded-lg p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs text-teal-400 font-medium uppercase tracking-wider">
              Deduplication Rate
            </span>
            <div className="text-3xl font-bold tracking-tight text-white mt-1">
              {metrics.deduplicationRatePercent}%
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Automated RapidFuzz & Geo-distance engine resolved {metrics.autoMatchedCount} duplicate
              records into verified canonical clusters.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Verified clusters: {metrics.totalCanonicalEntities}</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Inventory Consolidation</h3>
              <p className="text-xs text-slate-500">Raw Supplier Feeds vs Consolidated Canonical Entities</p>
            </div>
          </div>
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B192C', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Raw" fill="#94A3B8" name="Raw Supplier Listings" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Canonical" fill="#0D9488" name="Canonical Master Entities" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Supplier Feeds & Recent Imports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Distribution */}
        <Card title="Connected Supplier Feeds" subtitle="Active suppliers and inventory load">
          <div className="divide-y divide-slate-100">
            {data?.supplierDistribution.map((sup) => (
              <div key={sup.supplierId} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-900">{sup.name}</p>
                  <p className="text-slate-500 text-[11px] font-mono">{sup.code}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800">{sup.listingCount} listings</span>
                  <p className="text-[11px] text-teal-700">
                    Reliability {(sup.reliabilityScore * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Imports */}
        <Card title="Recent Inventory Imports" subtitle="Batch ingest tracking and pipeline status">
          <div className="divide-y divide-slate-100">
            {data?.recentImports.map((imp) => (
              <div key={imp.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 font-mono">{imp.importRef}</span>
                    <Badge status={imp.category} />
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Supplier: {imp.supplierName} • {imp.totalRecords} records
                  </p>
                </div>
                <div className="text-right">
                  <Badge status={imp.status} />
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(imp.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
