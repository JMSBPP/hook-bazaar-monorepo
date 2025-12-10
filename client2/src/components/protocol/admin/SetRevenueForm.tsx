import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Info, Loader2 } from 'lucide-react';

interface SetRevenueFormProps {
  protocolId: bigint | null;
  type: 'protocol' | 'pool';
  pools?: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

const SetRevenueForm: React.FC<SetRevenueFormProps> = ({
  protocolId,
  type,
  pools = [],
  onSuccess,
  onCancel,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedPoolId, setSelectedPoolId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) < 0) {
      setError('Revenue amount must be a non-negative number');
      return false;
    }

    if (type === 'pool' && !selectedPoolId) {
      setError('Please select a pool');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !protocolId) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, this would call the appropriate contract function:
      // - setProtocolRevenue(protocolId) for protocol-wide revenue
      // - setPoolRevenue(protocolId, poolId) for pool-specific revenue

      console.log('Setting revenue:', {
        protocolId: protocolId.toString(),
        type,
        amount,
        poolId: type === 'pool' ? selectedPoolId : undefined,
      });

      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1500));

      onSuccess();
    } catch (err) {
      console.error('Failed to set revenue:', err);
      setError('Failed to set revenue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="angular-clip" style={{ background: 'var(--color-white)', border: '2px solid var(--color-secondary)' }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '2px solid var(--color-secondary)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-secondary)' }}
            aria-label="Back to overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold font-heading" style={{ color: 'var(--color-secondary)' }}>
              Set <span style={{ color: 'var(--color-primary)' }}>{type === 'protocol' ? 'Protocol' : 'Pool'}</span> Revenue
            </h2>
            <p className="text-sm font-body" style={{ color: 'var(--color-black)' }}>
              Configure revenue settings for Protocol #{protocolId?.toString()}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Pool Selection (only for pool revenue) */}
          {type === 'pool' && (
            <div>
              <label htmlFor="poolId" className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
                Select Pool
              </label>
              {pools.length === 0 ? (
                <div className="angular-clip p-4 text-sm" style={{ background: 'var(--color-marble-light)', border: '2px solid var(--color-accent)', color: 'var(--color-secondary)' }}>
                  No pools available. Create a pool first to set pool-specific revenue.
                </div>
              ) : (
                <select
                  id="poolId"
                  value={selectedPoolId}
                  onChange={(e) => setSelectedPoolId(e.target.value)}
                  className="w-full px-4 py-3 font-mono text-sm angular-clip"
                  style={{
                    border: '2px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    background: 'var(--color-white)',
                  }}
                >
                  <option value="">Select a pool...</option>
                  {pools.map((poolId) => (
                    <option key={poolId} value={poolId}>
                      {poolId.slice(0, 10)}...{poolId.slice(-8)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Revenue Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
              Revenue Amount (in Wei)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              </div>
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 angular-clip"
                style={{
                  border: '2px solid var(--color-secondary)',
                  color: 'var(--color-secondary)',
                  background: 'var(--color-white)',
                }}
              />
            </div>
            <p className="mt-1 text-xs font-body" style={{ color: 'var(--color-black)' }}>
              Enter the revenue amount in wei (1 ETH = 10^18 wei)
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
              Quick Amount
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '0.01 ETH', value: '10000000000000000' },
                { label: '0.1 ETH', value: '100000000000000000' },
                { label: '1 ETH', value: '1000000000000000000' },
                { label: '10 ETH', value: '10000000000000000000' },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setAmount(preset.value)}
                  className="angular-clip px-4 py-2 text-sm font-medium font-heading transition-all"
                  style={{
                    border: `2px solid ${amount === preset.value ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
                    background: amount === preset.value ? 'var(--color-primary)' : 'var(--color-white)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="angular-clip p-4 text-sm" style={{ background: 'var(--color-marble-light)', border: '2px solid var(--color-accent)', color: 'var(--color-accent)' }}>
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="angular-clip p-4 flex gap-3" style={{ background: 'var(--color-marble-light)', border: '2px solid var(--color-secondary)' }}>
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-secondary)' }} />
            <div className="text-sm" style={{ color: 'var(--color-secondary)' }}>
              <p className="font-medium font-heading mb-1">About Revenue Settings:</p>
              <ul className="list-disc list-inside space-y-1 font-body" style={{ color: 'var(--color-black)' }}>
                {type === 'protocol' ? (
                  <>
                    <li>Protocol revenue applies to all pools in your protocol</li>
                    <li>Revenue is distributed according to your protocol's fee structure</li>
                    <li>Changes take effect after the next block confirmation</li>
                  </>
                ) : (
                  <>
                    <li>Pool revenue is specific to the selected pool</li>
                    <li>This overrides the protocol-level revenue for this pool</li>
                    <li>Use this for pools with custom revenue requirements</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6" style={{ borderTop: '2px solid var(--color-secondary)' }}>
          <button
            type="button"
            onClick={onCancel}
            className="angular-clip-button px-6 py-3 font-medium font-heading uppercase tracking-wider transition-all"
            style={{
              background: 'var(--color-white)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !protocolId || (type === 'pool' && pools.length === 0)}
            className="angular-clip-button px-6 py-3 font-medium font-heading uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-secondary)',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting Revenue...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                Set Revenue
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetRevenueForm;
