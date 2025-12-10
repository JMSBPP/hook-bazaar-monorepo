import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileCode
} from 'lucide-react';
import type { AVSVerificationResult, AVSFinding, CompilationResult } from '../../types/hookSpec';

interface AVSVerificationResultsProps {
  compilationResult: CompilationResult;
  avsResult: AVSVerificationResult;
}

export default function AVSVerificationResults({
  compilationResult,
  avsResult
}: AVSVerificationResultsProps) {
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());

  const toggleFinding = (id: string) => {
    setExpandedFindings(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'var(--color-primary)';
    if (score >= 80) return '#FFA500';  // Orange
    return 'var(--color-accent)';
  };

  const getSeverityIcon = (severity: AVSFinding['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle size={16} style={{ color: 'var(--color-accent)' }} />;
      case 'warning':
        return <AlertTriangle size={16} style={{ color: '#FFA500' }} />;
      case 'info':
        return <Info size={16} style={{ color: 'var(--color-accent)' }} />;
    }
  };

  const getSeverityBg = (severity: AVSFinding['severity']) => {
    switch (severity) {
      case 'critical':
        return 'rgba(232, 90, 79, 0.1)';
      case 'warning':
        return 'rgba(255, 165, 0, 0.1)';
      case 'info':
        return 'rgba(100, 100, 100, 0.1)';
    }
  };

  const criticalCount = avsResult.findings.filter(f => f.severity === 'critical').length;
  const warningCount = avsResult.findings.filter(f => f.severity === 'warning').length;
  const infoCount = avsResult.findings.filter(f => f.severity === 'info').length;

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
      <div className="flex items-center gap-3 mb-6">
        <div
          className="angular-clip w-12 h-12 flex items-center justify-center"
          style={{
            background: avsResult.compliant ? 'var(--color-primary)' : 'var(--color-accent)',
            border: '2px solid var(--color-secondary)'
          }}
        >
          <Shield size={24} style={{ color: 'var(--color-secondary)' }} />
        </div>
        <div>
          <h3
            className="font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h4)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            AVS Verification Results
          </h3>
          <p
            className="font-body"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            Code compliance checked by staked operators
          </p>
        </div>
      </div>

      {/* Compilation Status */}
      <div
        className="angular-clip p-4 mb-4"
        style={{
          background: compilationResult.success ? 'rgba(255, 215, 0, 0.1)' : 'rgba(232, 90, 79, 0.1)',
          border: `1px solid ${compilationResult.success ? 'var(--color-primary)' : 'var(--color-accent)'}`
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FileCode size={18} style={{ color: compilationResult.success ? 'var(--color-primary)' : 'var(--color-accent)' }} />
          <span
            className="font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Compilation {compilationResult.success ? 'Successful' : 'Failed'}
          </span>
        </div>
        {compilationResult.success && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <span
                className="font-heading block"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Bytecode Hash
              </span>
              <code
                className="font-mono"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: '11px'
                }}
              >
                {compilationResult.bytecodeHash?.slice(0, 18)}...
              </code>
            </div>
            <div>
              <span
                className="font-heading block"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Deployed Bytecode Hash
              </span>
              <code
                className="font-mono"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: '11px'
                }}
              >
                {compilationResult.deployedBytecodeHash?.slice(0, 18)}...
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Score */}
      <div
        className="angular-clip p-6 mb-4"
        style={{
          background: 'var(--color-marble-light)',
          border: '2px solid var(--color-secondary)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span
            className="font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Compliance Score
          </span>
          <span
            className="font-heading"
            style={{
              color: getScoreColor(avsResult.complianceScore),
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {avsResult.complianceScore.toFixed(1)}%
          </span>
        </div>

        {/* Score Bar */}
        <div
          className="h-4 angular-clip overflow-hidden"
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-accent)'
          }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${avsResult.complianceScore}%`,
              background: getScoreColor(avsResult.complianceScore)
            }}
          />
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex items-center gap-2">
          {avsResult.compliant ? (
            <>
              <CheckCircle size={20} style={{ color: 'var(--color-primary)' }} />
              <span
                className="font-heading"
                style={{
                  color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  textTransform: 'uppercase'
                }}
              >
                Compliant with Specification
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={20} style={{ color: 'var(--color-accent)' }} />
              <span
                className="font-heading"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  textTransform: 'uppercase'
                }}
              >
                Non-Compliant (Review Findings)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Attestation Info */}
      <div
        className="angular-clip p-4 mb-4"
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-accent)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span
              className="font-heading block mb-1"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Attestation ID
            </span>
            <div className="flex items-center gap-2">
              <code
                className="font-mono"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-caption)'
                }}
              >
                {avsResult.attestationId.slice(0, 20)}...
              </code>
              <a
                href={`https://etherscan.io/tx/${avsResult.attestationTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: 'var(--color-primary)' }}
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <div>
            <span
              className="font-heading block mb-1"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Verified At
            </span>
            <span
              className="font-body"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            >
              {new Date(avsResult.verificationTimestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Findings Summary */}
      {avsResult.findings.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <span
              className="font-heading"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              Findings ({avsResult.findings.length})
            </span>
            {criticalCount > 0 && (
              <span
                className="angular-clip px-2 py-1 flex items-center gap-1"
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-white)',
                  fontSize: 'var(--font-size-caption)'
                }}
              >
                <AlertCircle size={12} />
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span
                className="angular-clip px-2 py-1 flex items-center gap-1"
                style={{
                  background: '#FFA500',
                  color: 'var(--color-white)',
                  fontSize: 'var(--font-size-caption)'
                }}
              >
                <AlertTriangle size={12} />
                {warningCount} Warning
              </span>
            )}
            {infoCount > 0 && (
              <span
                className="angular-clip px-2 py-1 flex items-center gap-1"
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-white)',
                  fontSize: 'var(--font-size-caption)'
                }}
              >
                <Info size={12} />
                {infoCount} Info
              </span>
            )}
          </div>

          {/* Findings List */}
          <div className="space-y-2">
            {avsResult.findings.map((finding, index) => {
              const findingId = `${finding.ruleId}-${index}`;
              const isExpanded = expandedFindings.has(findingId);

              return (
                <div
                  key={findingId}
                  className="angular-clip overflow-hidden"
                  style={{
                    background: getSeverityBg(finding.severity),
                    border: '1px solid var(--color-accent)'
                  }}
                >
                  <button
                    onClick={() => toggleFinding(findingId)}
                    className="w-full p-3 flex items-center gap-3 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} style={{ color: 'var(--color-secondary)' }} />
                    ) : (
                      <ChevronRight size={16} style={{ color: 'var(--color-secondary)' }} />
                    )}
                    {getSeverityIcon(finding.severity)}
                    <div className="flex-1 min-w-0">
                      <span
                        className="font-heading"
                        style={{
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-body-sm)',
                          fontWeight: 'var(--font-weight-bold)'
                        }}
                      >
                        [{finding.ruleId}] {finding.ruleName}
                      </span>
                    </div>
                    <span
                      className="angular-clip px-2 py-1 font-heading flex-shrink-0"
                      style={{
                        background:
                          finding.severity === 'critical'
                            ? 'var(--color-accent)'
                            : finding.severity === 'warning'
                            ? '#FFA500'
                            : 'var(--color-accent)',
                        color: 'var(--color-white)',
                        fontSize: '10px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {finding.severity}
                    </span>
                  </button>

                  {isExpanded && (
                    <div
                      className="p-4 pt-0"
                      style={{ borderTop: '1px solid var(--color-accent)' }}
                    >
                      <p
                        className="font-body mb-3"
                        style={{
                          color: 'var(--color-black)',
                          fontSize: 'var(--font-size-body-sm)'
                        }}
                      >
                        {finding.description}
                      </p>

                      {finding.codeLocation && (
                        <div
                          className="angular-clip p-2 mb-3"
                          style={{
                            background: 'var(--color-secondary)',
                            color: 'var(--color-white)'
                          }}
                        >
                          <span
                            className="font-heading block mb-1"
                            style={{
                              fontSize: 'var(--font-size-caption)',
                              color: 'var(--color-primary)'
                            }}
                          >
                            Code Location
                          </span>
                          <code
                            className="font-mono"
                            style={{ fontSize: 'var(--font-size-caption)' }}
                          >
                            Lines {finding.codeLocation.startLine}-{finding.codeLocation.endLine}
                            {finding.codeLocation.functionName && ` in ${finding.codeLocation.functionName}()`}
                          </code>
                        </div>
                      )}

                      {finding.specReference && (
                        <div className="flex items-center gap-2">
                          <span
                            className="font-heading"
                            style={{
                              color: 'var(--color-accent)',
                              fontSize: 'var(--font-size-caption)'
                            }}
                          >
                            Spec Reference:
                          </span>
                          <span
                            className="font-body"
                            style={{
                              color: 'var(--color-secondary)',
                              fontSize: 'var(--font-size-caption)'
                            }}
                          >
                            {finding.specReference}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* No Findings */}
      {avsResult.findings.length === 0 && (
        <div
          className="angular-clip p-6 text-center"
          style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid var(--color-primary)'
          }}
        >
          <CheckCircle size={32} style={{ color: 'var(--color-primary)', margin: '0 auto 12px' }} />
          <span
            className="font-heading block"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            No Issues Found
          </span>
          <p
            className="font-body mt-1"
            style={{
              color: 'var(--color-accent)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            Your code fully complies with the HookSpec specification
          </p>
        </div>
      )}
    </div>
  );
}
