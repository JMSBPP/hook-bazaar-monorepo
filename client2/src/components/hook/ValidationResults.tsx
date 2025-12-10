import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
import type { ValidationResult } from '../../types/hookSpec';

interface ValidationResultsProps {
  results: ValidationResult[];
  isLoading: boolean;
  onFixError?: (ruleId: string, errorIndex: number) => void;
}

const RULE_DESCRIPTIONS: Record<string, string> = {
  V1: 'All referenced pool state variables must exist in system-state.md',
  V2: 'Hook state variable names must be unique',
  V3: 'System functions must use valid Uniswap V4 callbacks',
  V4: 'Equations must use valid symbols from state definitions',
  V5: 'Types must be valid Solidity types',
  V6: 'All writes must reference declared hook state variables'
};

export default function ValidationResults({
  results,
  isLoading,
  onFixError
}: ValidationResultsProps) {
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const toggleRule = (ruleId: string) => {
    setExpandedRules(prev => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  const warningCount = results.reduce((acc, r) => acc + r.warnings.length, 0);
  const allPassed = failedCount === 0;

  if (isLoading) {
    return (
      <div
        className="angular-clip p-6"
        style={{
          background: 'var(--color-white)',
          border: '2px solid var(--color-secondary)'
        }}
      >
        <div className="flex items-center justify-center gap-3">
          <div
            className="w-6 h-6 border-3 rounded-full animate-spin"
            style={{
              borderColor: 'var(--color-primary)',
              borderTopColor: 'transparent'
            }}
          />
          <span
            className="font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            Validating HookSpec...
          </span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div
        className="angular-clip p-6"
        style={{
          background: 'var(--color-marble-light)',
          border: '2px solid var(--color-accent)'
        }}
      >
        <div className="flex items-center gap-3">
          <Info size={24} style={{ color: 'var(--color-accent)' }} />
          <span
            className="font-body"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)'
            }}
          >
            Click "Validate HookSpec" to check compatibility with the State Space Model
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="angular-clip"
      style={{
        background: 'var(--color-white)',
        border: '2px solid var(--color-secondary)',
        overflow: 'hidden'
      }}
    >
      {/* Summary Header */}
      <div
        className="p-4"
        style={{
          background: allPassed ? 'var(--color-primary)' : 'rgba(232, 90, 79, 0.1)',
          borderBottom: '2px solid var(--color-secondary)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allPassed ? (
              <CheckCircle size={28} style={{ color: 'var(--color-secondary)' }} />
            ) : (
              <XCircle size={28} style={{ color: 'var(--color-accent)' }} />
            )}
            <div>
              <h3
                className="font-heading"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-h5)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                {allPassed ? 'Validation Passed' : 'Validation Failed'}
              </h3>
              <p
                className="font-body"
                style={{
                  color: allPassed ? 'var(--color-secondary)' : 'var(--color-accent)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                {allPassed
                  ? 'Your HookSpec is compatible with the State Space Model'
                  : `${failedCount} rule${failedCount > 1 ? 's' : ''} failed validation`
                }
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <span
                className="angular-clip px-3 py-1 font-heading"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-h5)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                {passedCount}
              </span>
              <p
                className="mt-1 font-heading"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Passed
              </p>
            </div>
            {failedCount > 0 && (
              <div className="text-center">
                <span
                  className="angular-clip px-3 py-1 font-heading"
                  style={{
                    background: 'var(--color-accent)',
                    color: 'var(--color-white)',
                    fontSize: 'var(--font-size-h5)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  {failedCount}
                </span>
                <p
                  className="mt-1 font-heading"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Failed
                </p>
              </div>
            )}
            {warningCount > 0 && (
              <div className="text-center">
                <span
                  className="angular-clip px-3 py-1 font-heading"
                  style={{
                    background: 'rgba(255, 215, 0, 0.3)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-h5)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  {warningCount}
                </span>
                <p
                  className="mt-1 font-heading"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Warnings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rule Results */}
      <div className="divide-y" style={{ borderColor: 'var(--color-accent)' }}>
        {results.map(result => {
          const isExpanded = expandedRules.has(result.ruleId);
          const hasDetails = result.errors.length > 0 || result.warnings.length > 0;

          return (
            <div key={result.ruleId}>
              <button
                onClick={() => hasDetails && toggleRule(result.ruleId)}
                className="w-full p-4 flex items-center justify-between transition-colors"
                style={{
                  cursor: hasDetails ? 'pointer' : 'default'
                }}
                disabled={!hasDetails}
              >
                <div className="flex items-center gap-3">
                  {hasDetails && (
                    isExpanded ? (
                      <ChevronDown size={18} style={{ color: 'var(--color-accent)' }} />
                    ) : (
                      <ChevronRight size={18} style={{ color: 'var(--color-accent)' }} />
                    )
                  )}
                  {!hasDetails && <div className="w-[18px]" />}

                  {result.passed ? (
                    <CheckCircle size={20} style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <XCircle size={20} style={{ color: 'var(--color-accent)' }} />
                  )}

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono angular-clip px-2 py-0.5"
                        style={{
                          background: result.passed ? 'var(--color-primary)' : 'var(--color-accent)',
                          color: result.passed ? 'var(--color-secondary)' : 'var(--color-white)',
                          fontSize: 'var(--font-size-caption)',
                          fontWeight: 'var(--font-weight-bold)'
                        }}
                      >
                        {result.ruleId}
                      </span>
                      <span
                        className="font-heading"
                        style={{
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-body-sm)',
                          fontWeight: 'var(--font-weight-medium)'
                        }}
                      >
                        {result.ruleName}
                      </span>
                    </div>
                    <p
                      className="font-body mt-1"
                      style={{
                        color: 'var(--color-black)',
                        fontSize: 'var(--font-size-caption)'
                      }}
                    >
                      {RULE_DESCRIPTIONS[result.ruleId] || 'Validation rule'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {result.warnings.length > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={14} style={{ color: 'var(--color-primary)' }} />
                      <span
                        className="font-mono"
                        style={{
                          color: 'var(--color-primary)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        {result.warnings.length}
                      </span>
                    </span>
                  )}
                  <span
                    className="angular-clip px-2 py-1 font-heading"
                    style={{
                      background: result.passed ? 'rgba(255, 215, 0, 0.2)' : 'rgba(232, 90, 79, 0.2)',
                      color: result.passed ? 'var(--color-secondary)' : 'var(--color-accent)',
                      fontSize: 'var(--font-size-caption)',
                      fontWeight: 'var(--font-weight-bold)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {result.passed ? 'Pass' : 'Fail'}
                  </span>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && hasDetails && (
                <div
                  className="px-4 pb-4 ml-[42px]"
                  style={{
                    background: 'var(--color-marble-light)'
                  }}
                >
                  {/* Errors */}
                  {result.errors.length > 0 && (
                    <div className="mb-3">
                      <span
                        className="font-heading"
                        style={{
                          color: 'var(--color-accent)',
                          fontSize: 'var(--font-size-caption)',
                          textTransform: 'uppercase'
                        }}
                      >
                        Errors
                      </span>
                      <ul className="mt-2 space-y-2">
                        {result.errors.map((error, idx) => (
                          <li
                            key={idx}
                            className="angular-clip p-3 flex items-start justify-between gap-3"
                            style={{
                              background: 'rgba(232, 90, 79, 0.1)',
                              border: '1px solid var(--color-accent)'
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <XCircle
                                size={16}
                                style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }}
                              />
                              <span
                                className="font-mono"
                                style={{
                                  color: 'var(--color-accent)',
                                  fontSize: 'var(--font-size-caption)'
                                }}
                              >
                                {error}
                              </span>
                            </div>
                            {onFixError && (
                              <button
                                onClick={() => onFixError(result.ruleId, idx)}
                                className="font-heading text-xs uppercase tracking-wider transition-colors"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                Fix
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {result.warnings.length > 0 && (
                    <div>
                      <span
                        className="font-heading"
                        style={{
                          color: 'var(--color-primary)',
                          fontSize: 'var(--font-size-caption)',
                          textTransform: 'uppercase'
                        }}
                      >
                        Warnings
                      </span>
                      <ul className="mt-2 space-y-2">
                        {result.warnings.map((warning, idx) => (
                          <li
                            key={idx}
                            className="angular-clip p-3 flex items-start gap-2"
                            style={{
                              background: 'rgba(255, 215, 0, 0.1)',
                              border: '1px solid var(--color-primary)'
                            }}
                          >
                            <AlertTriangle
                              size={16}
                              style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }}
                            />
                            <span
                              className="font-mono"
                              style={{
                                color: 'var(--color-secondary)',
                                fontSize: 'var(--font-size-caption)'
                              }}
                            >
                              {warning}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
