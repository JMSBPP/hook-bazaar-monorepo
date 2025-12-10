import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  CheckCircle,
  Shield,
  Lock,
  Tag,
  Users,
  ChevronDown
} from 'lucide-react';
import type {
  HookListingSummary,
  HookCategory,
  PricingModel
} from '../../types/hookSpec';
import { HOOK_CATEGORIES } from '../../types/hookSpec';

interface HookBrowserProps {
  hooks: HookListingSummary[];
  onSelectHook: (hook: HookListingSummary) => void;
  selectedHookId?: number;
  isLoading?: boolean;
}

type ViewMode = 'grid' | 'list';

interface Filters {
  category: HookCategory | 'ALL';
  verified: boolean | null;
  minComplianceScore: number;
  pricingModel: PricingModel | 'ALL';
  searchQuery: string;
}

export default function HookBrowser({
  hooks,
  onSelectHook,
  selectedHookId,
  isLoading
}: HookBrowserProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<Filters>({
    category: 'ALL',
    verified: null,
    minComplianceScore: 0,
    pricingModel: 'ALL',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredHooks = useMemo(() => {
    return hooks.filter(hook => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          hook.name.toLowerCase().includes(query) ||
          hook.description?.toLowerCase().includes(query) ||
          hook.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== 'ALL' && hook.category !== filters.category) {
        return false;
      }

      // Verified filter
      if (filters.verified !== null && hook.verified !== filters.verified) {
        return false;
      }

      // Compliance score filter
      if (filters.minComplianceScore > 0) {
        if (!hook.complianceScore || hook.complianceScore < filters.minComplianceScore) {
          return false;
        }
      }

      // Pricing model filter
      if (filters.pricingModel !== 'ALL' && hook.pricing.model !== filters.pricingModel) {
        return false;
      }

      return true;
    });
  }, [hooks, filters]);

  const formatPrice = (hook: HookListingSummary) => {
    const { pricing } = hook;
    if (pricing.model === 'FIXED' && pricing.fixedPrice) {
      const ethValue = parseFloat(pricing.fixedPrice) / 1e18;
      return `${ethValue.toFixed(4)} ETH`;
    }
    if (pricing.model === 'REVENUE_SHARE' && pricing.revenueShareBps) {
      return `${(pricing.revenueShareBps / 100).toFixed(2)}% Rev Share`;
    }
    if (pricing.model === 'HYBRID') {
      const parts = [];
      if (pricing.fixedPrice) {
        const ethValue = parseFloat(pricing.fixedPrice) / 1e18;
        parts.push(`${ethValue.toFixed(4)} ETH`);
      }
      if (pricing.revenueShareBps) {
        parts.push(`${(pricing.revenueShareBps / 100).toFixed(2)}%`);
      }
      return parts.join(' + ');
    }
    return 'Contact';
  };

  const getCategoryLabel = (category: HookCategory) => {
    return HOOK_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  return (
    <div
      className="angular-clip"
      style={{
        background: 'var(--color-white)',
        border: '2px solid var(--color-secondary)',
        padding: 'var(--space-lg)'
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2
          className="font-heading"
          style={{
            color: 'var(--color-secondary)',
            fontSize: 'var(--font-size-h4)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          Hook Marketplace
        </h2>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex">
            <button
              onClick={() => setViewMode('grid')}
              className="angular-clip p-2"
              style={{
                background: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-marble-light)',
                color: viewMode === 'grid' ? 'var(--color-secondary)' : 'var(--color-accent)',
                border: '1px solid var(--color-accent)'
              }}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="angular-clip p-2"
              style={{
                background: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-marble-light)',
                color: viewMode === 'list' ? 'var(--color-secondary)' : 'var(--color-accent)',
                border: '1px solid var(--color-accent)'
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-accent)' }}
            />
            <input
              type="text"
              placeholder="Search hooks by name, description, or tags..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="angular-clip w-full pl-10 pr-4 py-2 font-body"
              style={{
                background: 'var(--color-marble-light)',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="angular-clip px-4 py-2 flex items-center gap-2"
            style={{
              background: showFilters ? 'var(--color-primary)' : 'var(--color-marble-light)',
              color: showFilters ? 'var(--color-secondary)' : 'var(--color-accent)',
              border: '1px solid var(--color-accent)'
            }}
          >
            <Filter size={18} />
            <span className="font-heading text-sm">Filters</span>
            <ChevronDown
              size={16}
              style={{
                transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            className="angular-clip p-4 grid grid-cols-1 md:grid-cols-4 gap-4"
            style={{
              background: 'var(--color-marble-light)',
              border: '1px solid var(--color-accent)'
            }}
          >
            {/* Category Filter */}
            <div>
              <label
                className="font-heading block mb-2"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as HookCategory | 'ALL' })}
                className="angular-clip w-full px-3 py-2 font-body"
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-accent)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                <option value="ALL">All Categories</option>
                {HOOK_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div>
              <label
                className="font-heading block mb-2"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Pricing Model
              </label>
              <select
                value={filters.pricingModel}
                onChange={(e) => setFilters({ ...filters, pricingModel: e.target.value as PricingModel | 'ALL' })}
                className="angular-clip w-full px-3 py-2 font-body"
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-accent)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                <option value="ALL">All Pricing</option>
                <option value="FIXED">Fixed Price</option>
                <option value="REVENUE_SHARE">Revenue Share</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            {/* Verified Filter */}
            <div>
              <label
                className="font-heading block mb-2"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Verification
              </label>
              <select
                value={filters.verified === null ? 'ALL' : filters.verified ? 'VERIFIED' : 'UNVERIFIED'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters({
                    ...filters,
                    verified: val === 'ALL' ? null : val === 'VERIFIED'
                  });
                }}
                className="angular-clip w-full px-3 py-2 font-body"
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-accent)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                <option value="ALL">All</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>

            {/* Min Compliance Score */}
            <div>
              <label
                className="font-heading block mb-2"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Min Compliance: {filters.minComplianceScore}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minComplianceScore}
                onChange={(e) => setFilters({ ...filters, minComplianceScore: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <span
          className="font-body"
          style={{
            color: 'var(--color-accent)',
            fontSize: 'var(--font-size-body-sm)'
          }}
        >
          {filteredHooks.length} hooks found
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div
            className="w-12 h-12 mx-auto mb-4 angular-clip animate-pulse"
            style={{ background: 'var(--color-primary)' }}
          />
          <p
            className="font-body"
            style={{ color: 'var(--color-accent)' }}
          >
            Loading hooks...
          </p>
        </div>
      )}

      {/* Hook Grid/List */}
      {!isLoading && (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {filteredHooks.map(hook => (
            <button
              key={hook.tokenId}
              onClick={() => onSelectHook(hook)}
              className={`angular-clip text-left transition-all duration-200 ${
                viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'
              }`}
              style={{
                background: selectedHookId === hook.tokenId
                  ? 'var(--color-primary)'
                  : 'var(--color-marble-light)',
                border: selectedHookId === hook.tokenId
                  ? '2px solid var(--color-secondary)'
                  : '1px solid var(--color-accent)',
                width: '100%'
              }}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3
                        className="font-heading"
                        style={{
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-body)',
                          fontWeight: 'var(--font-weight-bold)'
                        }}
                      >
                        {hook.name}
                      </h3>
                      <span
                        className="font-mono"
                        style={{
                          color: 'var(--color-accent)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        v{hook.version}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {hook.verified && (
                        <div title="Verified">
                          <CheckCircle size={16} style={{ color: 'var(--color-primary)' }} />
                        </div>
                      )}
                      {hook.cfheDeployed && (
                        <div title="CFHE Deployed">
                          <Lock size={16} style={{ color: 'var(--color-secondary)' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-3">
                    <span
                      className="angular-clip inline-block px-2 py-1 font-heading"
                      style={{
                        background: 'var(--color-secondary)',
                        color: 'var(--color-primary)',
                        fontSize: '10px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {getCategoryLabel(hook.category)}
                    </span>
                  </div>

                  {/* Description */}
                  {hook.description && (
                    <p
                      className="font-body mb-3 line-clamp-2"
                      style={{
                        color: 'var(--color-black)',
                        fontSize: 'var(--font-size-caption)'
                      }}
                    >
                      {hook.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {hook.complianceScore !== undefined && (
                        <div className="flex items-center gap-1">
                          <Shield size={14} style={{ color: 'var(--color-accent)' }} />
                          <span
                            className="font-mono"
                            style={{
                              color: 'var(--color-secondary)',
                              fontSize: 'var(--font-size-caption)'
                            }}
                          >
                            {hook.complianceScore}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} style={{ color: 'var(--color-accent)' }} />
                      <span
                        className="font-mono"
                        style={{
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        {hook.subscriptionCount}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div
                    className="mt-3 pt-3"
                    style={{ borderTop: '1px solid var(--color-accent)' }}
                  >
                    <span
                      className="font-heading"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      {formatPrice(hook)}
                    </span>
                  </div>
                </>
              ) : (
                // List View
                <>
                  {/* Icon */}
                  <div
                    className="angular-clip w-12 h-12 flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: 'var(--color-secondary)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    <Tag size={20} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="font-heading truncate"
                        style={{
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-body)',
                          fontWeight: 'var(--font-weight-bold)'
                        }}
                      >
                        {hook.name}
                      </h3>
                      <span
                        className="font-mono flex-shrink-0"
                        style={{
                          color: 'var(--color-accent)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        v{hook.version}
                      </span>
                      {hook.verified && <CheckCircle size={14} style={{ color: 'var(--color-primary)' }} />}
                      {hook.cfheDeployed && <Lock size={14} style={{ color: 'var(--color-secondary)' }} />}
                    </div>
                    <p
                      className="font-body truncate"
                      style={{
                        color: 'var(--color-black)',
                        fontSize: 'var(--font-size-caption)'
                      }}
                    >
                      {hook.description || 'No description'}
                    </p>
                  </div>

                  {/* Category */}
                  <span
                    className="angular-clip px-2 py-1 font-heading flex-shrink-0"
                    style={{
                      background: 'var(--color-secondary)',
                      color: 'var(--color-primary)',
                      fontSize: '10px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {getCategoryLabel(hook.category)}
                  </span>

                  {/* Stats */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {hook.complianceScore !== undefined && (
                      <div className="flex items-center gap-1">
                        <Shield size={14} style={{ color: 'var(--color-accent)' }} />
                        <span className="font-mono text-xs">{hook.complianceScore}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users size={14} style={{ color: 'var(--color-accent)' }} />
                      <span className="font-mono text-xs">{hook.subscriptionCount}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <span
                      className="font-heading"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      {formatPrice(hook)}
                    </span>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredHooks.length === 0 && (
        <div className="text-center py-12">
          <Tag size={48} className="mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
          <p
            className="font-heading mb-2"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)'
            }}
          >
            No hooks found
          </p>
          <p
            className="font-body"
            style={{
              color: 'var(--color-accent)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
