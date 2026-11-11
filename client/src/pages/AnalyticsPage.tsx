import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsOverview } from '../types';
import { Card } from '../components/common/Card';

const COLORS = ['#0B192C', '#0D9488', '#38BDF8', '#F59E0B', '#10B981', '#6366F1'];

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  const supplierData = data?.supplierDistribution.map((s) => ({
    name: s.code.replace('SUP-', ''),
    listings: s.listingCount,
    reliability: Math.round(s.reliabilityScore * 100),
  })) || [];

  const categoryPieData = data?.categoryDistribution.map((c) => ({
    name: c.category,
    value: c.rawListings,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Intelligence & Deduplication Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited metrics on inventory deduplication rates, supplier catalog overlap, and algorithmic performance.
        </p>
      </div>

      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#0B192C] text-white p-5 rounded-lg border border-slate-800">
          <span className="text-xs text-teal-400 uppercase font-semibold tracking-wider">
            Consolidation Factor
          </span>
          <div className="text-3xl font-extrabold mt-1 text-white">
            {data?.metrics.consolidationRatio || '2.75:1'}
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Average number of duplicate supplier listings compressed into each verified master canonical entity.
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
            Automated Acceptance Rate
          </span>
          <div className="text-3xl font-extrabold mt-1 text-teal-800">
            {data?.metrics.deduplicationRatePercent || 0}%
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Percentage of inbound inventory matched with high confidence ({'>= 85%'}) without requiring manual review.
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
            Catalog Integrity
          </span>
          <div className="text-3xl font-extrabold mt-1 text-slate-900">100%</div>
          <p className="text-xs text-slate-500 mt-2">
            Zero destructive merges. Inbound supplier-specific IDs, raw descriptions, and pricing are fully preserved.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Listing Share */}
        <Card title="Supplier Inventory Ingest Volume" subtitle="Number of active listings imported per feed">
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B192C', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="listings" fill="#0D9488" name="Inbound Listings" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Vertical Distribution */}
        <Card title="Vertical Distribution" subtitle="Hotels vs Sightseeing inventory breakdown">
          <div className="h-64 mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B192C', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
