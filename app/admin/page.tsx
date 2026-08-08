'use client';

import { useState } from 'react';
import { LayoutGrid, Users2, Package, ListOrdered, Sparkles } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MetricsGrid } from '@/components/admin/MetricsGrid';
import { CreatorsTable, type CreatorRowData } from '@/components/admin/CreatorsTable';
import { CreatorDetailSheet } from '@/components/admin/CreatorDetailSheet';
import { ConvertToCreator } from '@/components/admin/ConvertToCreator';
import { ProductForm, type ProductFormValue } from '@/components/admin/ProductForm';
import { ProductsList } from '@/components/admin/ProductsList';
import { RankingManager } from '@/components/admin/RankingManager';
import { CreatorDashboardSheet } from '@/components/creator/CreatorDashboardSheet';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'creators', label: 'Creators', icon: Users2 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'rankings', label: 'Rankings', icon: ListOrdered },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export default function AdminPage() {
  const [section, setSection] = useState<SectionId>('overview');
  const [selectedCreator, setSelectedCreator] = useState<CreatorRowData | null>(null);
  const [creatorsRefresh, setCreatorsRefresh] = useState(0);
  const [productsRefresh, setProductsRefresh] = useState(0);
  const [editingProduct, setEditingProduct] = useState<ProductFormValue | undefined>(undefined);
  const [creatorDashboardOpen, setCreatorDashboardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zadoc-background pb-24">
      <AdminHeader />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <nav className="flex gap-2 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                section === s.id ? 'border-zadoc-foreground bg-zadoc-foreground text-white' : 'border-zadoc-border text-zadoc-muted'
              }`}
            >
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
          <button
            onClick={() => setCreatorDashboardOpen(true)}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-zadoc-border px-4 py-2 text-sm font-medium text-zadoc-foreground"
          >
            <Sparkles className="h-4 w-4" /> Preview creator dashboard
          </button>
        </nav>

        {section === 'overview' && (
          <section className="space-y-4">
            <MetricsGrid />
          </section>
        )}

        {section === 'creators' && (
          <section className="space-y-6">
            <ConvertToCreator onCreated={() => setCreatorsRefresh((k) => k + 1)} />
            <CreatorsTable onSelect={setSelectedCreator} refreshKey={creatorsRefresh} />
          </section>
        )}

        {section === 'products' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <ProductForm
              key={editingProduct?.id ?? 'new'}
              initial={editingProduct}
              onSaved={() => {
                setProductsRefresh((k) => k + 1);
                setEditingProduct(undefined);
              }}
            />
            <ProductsList refreshKey={productsRefresh} onEdit={setEditingProduct} />
          </section>
        )}

        {section === 'rankings' && (
          <section>
            <RankingManager productsRefreshKey={productsRefresh} />
          </section>
        )}
      </main>

      <CreatorDetailSheet
        row={selectedCreator}
        onClose={() => setSelectedCreator(null)}
        onUpdated={() => setCreatorsRefresh((k) => k + 1)}
      />
      <CreatorDashboardSheet open={creatorDashboardOpen} onClose={() => setCreatorDashboardOpen(false)} />
    </div>
  );
}
