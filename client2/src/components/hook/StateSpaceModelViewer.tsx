import { useState, useMemo } from 'react';
import { Search, Copy, Check, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import type { StateSpaceModel, SystemStateVariable } from '../../types/hookSpec';
import LatexRenderer from '../common/LatexRenderer';

interface StateSpaceModelViewerProps {
  model: StateSpaceModel;
  onSelectVariable?: (variable: SystemStateVariable) => void;
  compact?: boolean;
}

type IndexType = 'lp' | 'trader' | 'shared';

interface SectionConfig {
  key: IndexType;
  title: string;
  description: string;
  symbol: string;
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'lp',
    title: 'LP Index Variables',
    description: 'Variables accessed by liquidity providers (positions, ticks)',
    symbol: 'S_{LP}'
  },
  {
    key: 'trader',
    title: 'Trader Index Variables',
    description: 'Variables accessed by traders during swaps (slot0, liquidity)',
    symbol: 'S_T'
  },
  {
    key: 'shared',
    title: 'Shared Variables',
    description: 'Variables accessed by both LPs and traders (fee growth)',
    symbol: 'S_{shared}'
  }
];

export default function StateSpaceModelViewer({
  model,
  onSelectVariable,
  compact = false
}: StateSpaceModelViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<IndexType>>(
    new Set(compact ? [] : ['lp', 'trader', 'shared'])
  );
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  // Filter variables based on search
  const filteredModel = useMemo(() => {
    if (!searchQuery.trim()) return model.indices;

    const query = searchQuery.toLowerCase();
    const filterVars = (vars: SystemStateVariable[]) =>
      vars.filter(
        v =>
          v.name.toLowerCase().includes(query) ||
          v.symbol.toLowerCase().includes(query) ||
          v.type.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      );

    return {
      lp: filterVars(model.indices.lp),
      trader: filterVars(model.indices.trader),
      shared: filterVars(model.indices.shared)
    };
  }, [model.indices, searchQuery]);

  const toggleSection = (key: IndexType) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSymbol(text);
    setTimeout(() => setCopiedSymbol(null), 2000);
  };

  const totalVariables =
    model.indices.lp.length + model.indices.trader.length + model.indices.shared.length;

  return (
    <div
      className="angular-clip"
      style={{
        background: 'var(--color-marble-light)',
        border: '2px solid var(--color-secondary)',
        padding: compact ? 'var(--space-md)' : 'var(--space-lg)',
        maxHeight: compact ? '600px' : 'none',
        overflow: compact ? 'auto' : 'visible',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 flex-shrink-0">
        <div>
          <h3
            className="font-heading mb-1 flex items-center gap-2 flex-wrap"
            style={{
              color: 'var(--color-secondary)',
              fontSize: compact ? 'var(--font-size-body)' : 'var(--font-size-h4)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            System State Model
            <span
              className="angular-clip px-2 py-1"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-white)',
                fontSize: 'var(--font-size-caption)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              READ ONLY
            </span>
          </h3>
          <p
            className="font-body"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            {totalVariables} state variables from IStateView (v{model.version})
          </p>
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-accent)' }}
          />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="angular-clip pl-10 pr-4 py-2 font-body w-full md:w-auto"
            style={{
              background: 'var(--color-white)',
              border: '2px solid var(--color-secondary)',
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body-sm)',
              minWidth: '200px'
            }}
          />
        </div>
      </div>

      {/* IPFS Info */}
      {!compact && (
        <div
          className="angular-clip p-3 mb-4 flex-shrink-0"
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-accent)'
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="min-w-0 flex-1">
              <span
                className="font-heading"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                IPFS CID
              </span>
              <p
                className="font-mono truncate"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                {model.ipfsCid}
              </p>
            </div>
            <a
              href={`https://ipfs.io/ipfs/${model.ipfsCid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-heading transition-colors flex-shrink-0"
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-caption)'
              }}
            >
              View on IPFS
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Sections - scrollable area */}
      <div
        className="space-y-3 flex-1 min-h-0"
        style={{
          overflowY: compact ? 'auto' : 'visible'
        }}
      >
        {SECTIONS.map(section => {
          const variables = filteredModel[section.key];
          const isExpanded = expandedSections.has(section.key);

          return (
            <div
              key={section.key}
              className="angular-clip"
              style={{
                background: 'var(--color-white)',
                border: '2px solid var(--color-secondary)'
              }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full p-3 flex items-center justify-between transition-colors"
                style={{
                  background: isExpanded ? 'var(--color-primary)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isExpanded ? (
                    <ChevronDown
                      size={18}
                      style={{ color: 'var(--color-secondary)' }}
                      className="flex-shrink-0"
                    />
                  ) : (
                    <ChevronRight
                      size={18}
                      style={{ color: 'var(--color-secondary)' }}
                      className="flex-shrink-0"
                    />
                  )}
                  <div className="text-left min-w-0">
                    <h4
                      className="font-heading flex items-center gap-2 flex-wrap"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      {section.title}
                      <span
                        className="inline-flex items-center"
                        style={{
                          color: 'var(--color-accent)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        (<LatexRenderer latex={section.symbol} />)
                      </span>
                    </h4>
                    {!compact && (
                      <p
                        className="font-body"
                        style={{
                          color: 'var(--color-black)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className="angular-clip px-2 py-1 font-heading flex-shrink-0"
                  style={{
                    background: 'var(--color-secondary)',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  {variables.length}
                </span>
              </button>

              {/* Section Content */}
              {isExpanded && variables.length > 0 && (
                <div className="p-3 pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ minWidth: '500px' }}>
                      <thead>
                        <tr
                          style={{
                            borderBottom: '2px solid var(--color-secondary)'
                          }}
                        >
                          <th
                            className="text-left py-2 px-2 font-heading"
                            style={{
                              color: 'var(--color-secondary)',
                              fontSize: 'var(--font-size-caption)',
                              textTransform: 'uppercase',
                              width: '30%'
                            }}
                          >
                            Variable
                          </th>
                          <th
                            className="text-left py-2 px-2 font-heading"
                            style={{
                              color: 'var(--color-secondary)',
                              fontSize: 'var(--font-size-caption)',
                              textTransform: 'uppercase',
                              width: '20%'
                            }}
                          >
                            Symbol
                          </th>
                          <th
                            className="text-left py-2 px-2 font-heading"
                            style={{
                              color: 'var(--color-secondary)',
                              fontSize: 'var(--font-size-caption)',
                              textTransform: 'uppercase',
                              width: '15%'
                            }}
                          >
                            Type
                          </th>
                          <th
                            className="text-left py-2 px-2 font-heading"
                            style={{
                              color: 'var(--color-secondary)',
                              fontSize: 'var(--font-size-caption)',
                              textTransform: 'uppercase',
                              width: '35%'
                            }}
                          >
                            Getter
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {variables.map((variable, idx) => (
                          <tr
                            key={variable.name}
                            className="transition-colors cursor-pointer"
                            style={{
                              borderBottom:
                                idx < variables.length - 1
                                  ? '1px solid var(--color-accent)'
                                  : 'none'
                            }}
                            onClick={() => onSelectVariable?.(variable)}
                            onMouseEnter={e => {
                              e.currentTarget.style.background =
                                'var(--color-marble-light)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <td className="py-2 px-2">
                              <div>
                                <span
                                  className="font-heading"
                                  style={{
                                    color: 'var(--color-secondary)',
                                    fontSize: 'var(--font-size-caption)',
                                    fontWeight: 'var(--font-weight-medium)'
                                  }}
                                >
                                  {variable.name}
                                </span>
                                <p
                                  className="font-body mt-1"
                                  style={{
                                    color: 'var(--color-accent)',
                                    fontSize: '11px',
                                    lineHeight: 1.3
                                  }}
                                >
                                  {variable.description}
                                </p>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                <code
                                  className="angular-clip px-2 py-1 inline-flex items-center"
                                  style={{
                                    background: 'var(--color-marble-light)',
                                    color: 'var(--color-primary)',
                                    fontSize: 'var(--font-size-caption)',
                                    border: '1px solid var(--color-primary)'
                                  }}
                                >
                                  <LatexRenderer latex={variable.symbol} />
                                </code>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    copyToClipboard(variable.symbol);
                                  }}
                                  className="p-1 transition-colors flex-shrink-0"
                                  title="Copy symbol"
                                >
                                  {copiedSymbol === variable.symbol ? (
                                    <Check
                                      size={12}
                                      style={{ color: 'var(--color-primary)' }}
                                    />
                                  ) : (
                                    <Copy
                                      size={12}
                                      style={{ color: 'var(--color-accent)' }}
                                    />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <code
                                className="font-mono"
                                style={{
                                  color: 'var(--color-accent)',
                                  fontSize: '11px'
                                }}
                              >
                                {variable.type}
                              </code>
                            </td>
                            <td className="py-2 px-2">
                              <code
                                className="font-mono break-all"
                                style={{
                                  color: 'var(--color-black)',
                                  fontSize: '11px',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {variable.getter}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {isExpanded && variables.length === 0 && (
                <div className="p-4 text-center">
                  <p
                    className="font-body"
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: 'var(--font-size-body-sm)'
                    }}
                  >
                    No variables match your search
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* IStateView Link */}
      {!compact && (
        <div className="mt-4 text-center flex-shrink-0">
          <a
            href="https://github.com/Uniswap/v4-periphery/blob/main/src/interfaces/IStateView.sol"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-heading transition-colors"
            style={{
              color: 'var(--color-primary)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            View IStateView Source Code
            <ExternalLink size={16} />
          </a>
        </div>
      )}
    </div>
  );
}
