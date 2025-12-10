import { useState } from 'react';
import {
  X,
  Shield,
  Lock,
  DollarSign,
  Users,
  Code,
  CheckCircle,
  ExternalLink,
  Copy,
  AlertTriangle,
  Play,
  FileCode
} from 'lucide-react';
import type {
  HookListing,
  HookCallback,
  PoolDeployment
} from '../../types/hookSpec';
import { HOOK_CATEGORIES } from '../../types/hookSpec';

interface HookLensProps {
  hook: HookListing | null;
  pools?: PoolDeployment[];
  onClose: () => void;
  onSubscribe: (hookTokenId: number, poolId: string) => void;
  onVerifyBytecode: (hookTokenId: number) => void;
  onTestFunctionality: (hookTokenId: number) => void;
  walletConnected: boolean;
  subscribing?: boolean;
}

export default function HookLens({
  hook,
  pools = [],
  onClose,
  onSubscribe,
  onVerifyBytecode,
  onTestFunctionality,
  walletConnected,
  subscribing
}: HookLensProps) {
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'capabilities' | 'pricing'>('overview');

  if (!hook) return null;

  const formatPrice = () => {
    const { pricing } = hook;
    if (pricing.model === 'FIXED' && pricing.fixedPrice) {
      const ethValue = parseFloat(pricing.fixedPrice) / 1e18;
      return `${ethValue.toFixed(4)} ETH`;
    }
    if (pricing.model === 'REVENUE_SHARE' && pricing.revenueShareBps) {
      return `${(pricing.revenueShareBps / 100).toFixed(2)}% Revenue Share`;
    }
    if (pricing.model === 'HYBRID') {
      const parts = [];
      if (pricing.fixedPrice) {
        const ethValue = parseFloat(pricing.fixedPrice) / 1e18;
        parts.push(`${ethValue.toFixed(4)} ETH`);
      }
      if (pricing.revenueShareBps) {
        parts.push(`${(pricing.revenueShareBps / 100).toFixed(2)}% Rev Share`);
      }
      return parts.join(' + ');
    }
    return 'Contact Developer';
  };

  const getCategoryLabel = () => {
    return HOOK_CATEGORIES.find(c => c.value === hook.metadata.category)?.label || hook.metadata.category;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCallbackDescription = (callback: HookCallback): string => {
    const descriptions: Record<HookCallback, string> = {
      beforeInitialize: 'Called before pool initialization',
      afterInitialize: 'Called after pool initialization',
      beforeAddLiquidity: 'Called before adding liquidity',
      afterAddLiquidity: 'Called after adding liquidity',
      beforeRemoveLiquidity: 'Called before removing liquidity',
      afterRemoveLiquidity: 'Called after removing liquidity',
      beforeSwap: 'Called before swap execution',
      afterSwap: 'Called after swap execution',
      beforeDonate: 'Called before donation',
      afterDonate: 'Called after donation'
    };
    return descriptions[callback];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="angular-clip w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--color-white)',
          border: '2px solid var(--color-secondary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-6 flex items-start justify-between"
          style={{
            background: 'var(--color-secondary)',
            borderBottom: '2px solid var(--color-primary)'
          }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2
                className="font-heading"
                style={{
                  color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-h3)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                {hook.metadata.name}
              </h2>
              <span
                className="angular-clip px-2 py-1 font-mono"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-caption)'
                }}
              >
                v{hook.metadata.version}
              </span>
              {hook.verification.codeVerified && (
                <div
                  className="flex items-center gap-1"
                  title="AVS Verified"
                >
                  <CheckCircle size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
              )}
              {hook.verification.cfheDeployed && (
                <div
                  className="flex items-center gap-1"
                  title="CFHE Encrypted"
                >
                  <Lock size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="angular-clip px-2 py-1 font-heading"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-secondary)',
                  fontSize: '10px',
                  textTransform: 'uppercase'
                }}
              >
                {getCategoryLabel()}
              </span>
              <span
                className="font-body"
                style={{
                  color: 'var(--color-marble-light)',
                  fontSize: 'var(--font-size-caption)'
                }}
              >
                Token #{hook.tokenId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: 'var(--color-accent)' }}
        >
          {(['overview', 'capabilities', 'pricing'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3 font-heading uppercase tracking-wider transition-colors"
              style={{
                color: activeTab === tab ? 'var(--color-secondary)' : 'var(--color-accent)',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : 'none',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3
                  className="font-heading mb-2"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  Description
                </h3>
                <p
                  className="font-body"
                  style={{
                    color: 'var(--color-black)',
                    fontSize: 'var(--font-size-body-sm)'
                  }}
                >
                  {hook.metadata.description}
                </p>
              </div>

              {/* Developer */}
              <div
                className="angular-clip p-4"
                style={{
                  background: 'var(--color-marble-light)',
                  border: '1px solid var(--color-accent)'
                }}
              >
                <span
                  className="font-heading block mb-2"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Developer
                </span>
                <div className="flex items-center gap-2">
                  <code
                    className="font-mono"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-body-sm)'
                    }}
                  >
                    {hook.developer.slice(0, 6)}...{hook.developer.slice(-4)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(hook.developer)}
                    className="p-1"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Verification Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="angular-clip p-4"
                  style={{
                    background: hook.verification.codeVerified
                      ? 'rgba(255, 215, 0, 0.15)'
                      : 'var(--color-marble-light)',
                    border: hook.verification.codeVerified
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-accent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={18} style={{ color: 'var(--color-secondary)' }} />
                    <span
                      className="font-heading"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      AVS Verification
                    </span>
                  </div>
                  {hook.verification.codeVerified ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={16} style={{ color: 'var(--color-primary)' }} />
                        <span
                          className="font-body"
                          style={{
                            color: 'var(--color-black)',
                            fontSize: 'var(--font-size-caption)'
                          }}
                        >
                          Code Verified
                        </span>
                      </div>
                      {hook.verification.complianceScore !== undefined && (
                        <div
                          className="font-heading mt-2"
                          style={{
                            color: 'var(--color-secondary)',
                            fontSize: 'var(--font-size-h4)',
                            fontWeight: 'var(--font-weight-bold)'
                          }}
                        >
                          {hook.verification.complianceScore}%
                          <span
                            className="ml-1 font-body"
                            style={{
                              fontSize: 'var(--font-size-caption)',
                              fontWeight: 'normal'
                            }}
                          >
                            Compliance
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} style={{ color: 'var(--color-accent)' }} />
                      <span
                        className="font-body"
                        style={{
                          color: 'var(--color-accent)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        Not Yet Verified
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="angular-clip p-4"
                  style={{
                    background: hook.verification.cfheDeployed
                      ? 'rgba(255, 215, 0, 0.15)'
                      : 'var(--color-marble-light)',
                    border: hook.verification.cfheDeployed
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-accent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={18} style={{ color: 'var(--color-secondary)' }} />
                    <span
                      className="font-heading"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      CFHE Deployment
                    </span>
                  </div>
                  {hook.verification.cfheDeployed ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={16} style={{ color: 'var(--color-primary)' }} />
                        <span
                          className="font-body"
                          style={{
                            color: 'var(--color-black)',
                            fontSize: 'var(--font-size-caption)'
                          }}
                        >
                          Encrypted Bytecode Deployed
                        </span>
                      </div>
                      {hook.verification.cfheContractAddress && (
                        <code
                          className="font-mono block mt-2"
                          style={{
                            color: 'var(--color-secondary)',
                            fontSize: '11px'
                          }}
                        >
                          {hook.verification.cfheContractAddress.slice(0, 10)}...
                        </code>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} style={{ color: 'var(--color-accent)' }} />
                      <span
                        className="font-body"
                        style={{
                          color: 'var(--color-accent)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        Not Deployed
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {hook.metadata.tags.length > 0 && (
                <div>
                  <h3
                    className="font-heading mb-2"
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: 'var(--font-size-caption)',
                      textTransform: 'uppercase'
                    }}
                  >
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hook.metadata.tags.map(tag => (
                      <span
                        key={tag}
                        className="angular-clip px-2 py-1 font-body"
                        style={{
                          background: 'var(--color-marble-light)',
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-caption)',
                          border: '1px solid var(--color-accent)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'capabilities' && (
            <div className="space-y-4">
              <h3
                className="font-heading mb-4"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                Hook Callbacks
              </h3>
              {hook.metadata.capabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="angular-clip p-4"
                  style={{
                    background: 'var(--color-marble-light)',
                    border: '1px solid var(--color-accent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Code size={16} style={{ color: 'var(--color-secondary)' }} />
                    <span
                      className="font-mono"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      {cap.callback}
                    </span>
                  </div>
                  <p
                    className="font-body mb-2"
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: 'var(--font-size-caption)'
                    }}
                  >
                    {getCallbackDescription(cap.callback)}
                  </p>
                  <p
                    className="font-body"
                    style={{
                      color: 'var(--color-black)',
                      fontSize: 'var(--font-size-body-sm)'
                    }}
                  >
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Pricing Model */}
              <div
                className="angular-clip p-6"
                style={{
                  background: 'var(--color-primary)',
                  border: '2px solid var(--color-secondary)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign size={24} style={{ color: 'var(--color-secondary)' }} />
                  <h3
                    className="font-heading"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-h4)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    HaaS Pricing
                  </h3>
                </div>

                <div
                  className="font-heading mb-4"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  {formatPrice()}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-heading"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-caption)',
                        textTransform: 'uppercase'
                      }}
                    >
                      Model:
                    </span>
                    <span
                      className="font-body"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body-sm)'
                      }}
                    >
                      {hook.pricing.model === 'FIXED' && 'One-time License Fee'}
                      {hook.pricing.model === 'REVENUE_SHARE' && 'Percentage of Pool Fees'}
                      {hook.pricing.model === 'HYBRID' && 'Fixed + Revenue Share'}
                    </span>
                  </div>
                  {hook.pricing.currency && hook.pricing.currency !== '0x0000000000000000000000000000000000000000' && (
                    <div className="flex items-center gap-2">
                      <span
                        className="font-heading"
                        style={{
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-caption)',
                          textTransform: 'uppercase'
                        }}
                      >
                        Currency:
                      </span>
                      <code
                        className="font-mono"
                        style={{
                          color: 'var(--color-secondary)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        {hook.pricing.currency.slice(0, 6)}...
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Pool Selection for Subscription */}
              <div>
                <label
                  className="font-heading block mb-2"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  Select Pool for Subscription
                </label>
                <select
                  value={selectedPoolId}
                  onChange={(e) => setSelectedPoolId(e.target.value)}
                  className="angular-clip w-full px-4 py-3 font-body"
                  style={{
                    background: 'var(--color-marble-light)',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)'
                  }}
                >
                  <option value="">Select a pool...</option>
                  {pools.map(pool => (
                    <option key={pool.poolId} value={pool.poolId}>
                      Pool {pool.poolId.slice(0, 10)}... (Chain {pool.chainId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div
          className="sticky bottom-0 p-6 flex flex-wrap gap-3"
          style={{
            background: 'var(--color-marble-light)',
            borderTop: '2px solid var(--color-accent)'
          }}
        >
          {/* Verify Bytecode */}
          <button
            onClick={() => onVerifyBytecode(hook.tokenId)}
            className="angular-clip-button px-4 py-2 flex items-center gap-2 font-heading uppercase tracking-wider transition-all"
            style={{
              background: 'var(--color-white)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-secondary)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            <FileCode size={16} />
            Verify Bytecode
          </button>

          {/* Test Functionality */}
          <button
            onClick={() => onTestFunctionality(hook.tokenId)}
            className="angular-clip-button px-4 py-2 flex items-center gap-2 font-heading uppercase tracking-wider transition-all"
            style={{
              background: 'var(--color-white)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-secondary)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            <Play size={16} />
            Test with AVS
          </button>

          {/* Subscribe Button */}
          <button
            onClick={() => selectedPoolId && onSubscribe(hook.tokenId, selectedPoolId)}
            disabled={!walletConnected || !selectedPoolId || subscribing}
            className="angular-clip-button flex-1 px-6 py-3 flex items-center justify-center gap-2 font-heading uppercase tracking-wider transition-all"
            style={{
              background: walletConnected && selectedPoolId
                ? 'var(--color-primary)'
                : 'var(--color-accent)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-secondary)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 'var(--font-weight-bold)',
              opacity: (!walletConnected || !selectedPoolId || subscribing) ? 0.5 : 1,
              cursor: (!walletConnected || !selectedPoolId || subscribing) ? 'not-allowed' : 'pointer'
            }}
          >
            {subscribing ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-secondary)' }}
                />
                Subscribing...
              </>
            ) : (
              <>
                <Users size={18} />
                {!walletConnected
                  ? 'Connect Wallet'
                  : !selectedPoolId
                  ? 'Select Pool to Subscribe'
                  : `Subscribe & Add Hook`
                }
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
