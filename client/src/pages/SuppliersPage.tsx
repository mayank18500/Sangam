import React, { useEffect, useState } from 'react';
import { Plus, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { supplierService } from '../services/supplierService';
import { Supplier } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formReliability, setFormReliability] = useState(0.9);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err: any) {
      setError('Failed to fetch suppliers from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);
    try {
      await supplierService.create({
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        contactEmail: formEmail.trim() || undefined,
        apiEndpoint: formEndpoint.trim() || undefined,
        reliabilityScore: Number(formReliability),
      });
      setIsModalOpen(false);
      // Reset form
      setFormCode('');
      setFormName('');
      setFormEmail('');
      setFormEndpoint('');
      loadSuppliers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create supplier');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supplier Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-supplier connections, API credentials, and historical fulfillment reliability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadSuppliers} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Connect New Supplier
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{supplier.name}</h3>
                  <span className="text-[11px] font-mono text-slate-500">{supplier.code}</span>
                </div>
                <Badge status={supplier.status} />
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reliability Score:</span>
                  <span className="font-semibold text-teal-800">
                    {(Number(supplier.reliabilityScore) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Listings:</span>
                  <span className="font-medium text-slate-800">{supplier.totalListings ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Completed Imports:</span>
                  <span className="font-medium text-slate-800">{supplier.totalImports ?? 0}</span>
                </div>
                {supplier.contactEmail && (
                  <div className="flex justify-between truncate">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700 font-mono text-[11px] truncate max-w-[150px]">
                      {supplier.contactEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Added {new Date(supplier.createdAt).toLocaleDateString()}
              </span>
              <span className="text-[11px] font-medium text-teal-700 flex items-center gap-1 cursor-pointer hover:underline">
                <span>View Feeds</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Supplier Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Connect New Supplier Feed">
        {formError && (
          <div className="mb-4 p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supplier Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. SUP-EXPEDIA"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Unique identifier prefix used across imports</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supplier Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Expedia Partner Solutions"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
            <input
              type="email"
              placeholder="integrations@supplier.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">API Endpoint URL</label>
            <input
              type="url"
              placeholder="https://api.supplier.com/v1/feed"
              value={formEndpoint}
              onChange={(e) => setFormEndpoint(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Initial Reliability Score (0.0 to 1.0)
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={formReliability}
              onChange={(e) => setFormReliability(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={formSubmitting}>
              {formSubmitting ? 'Creating...' : 'Register Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
