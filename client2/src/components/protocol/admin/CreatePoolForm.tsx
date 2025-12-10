import React, { useState } from 'react';
import { ArrowLeft, Info, Plus, Loader2 } from 'lucide-react';
import {
  FEE_TIERS,
  type CreatePoolFormValues,
} from '../../../types/protocolAdmin';

interface CreatePoolFormProps {
  protocolId: bigint | null;
  onSuccess: (poolId: string, initialTick: number) => void;
  onCancel: () => void;
}

const CreatePoolForm: React.FC<CreatePoolFormProps> = ({
  protocolId,
  onSuccess,
  onCancel,
}) => {
  const [formValues, setFormValues] = useState<CreatePoolFormValues>({
    token0: '',
    token1: '',
    fee: '3000',
    tickSpacing: '60',
    hookAddress: '0x0000000000000000000000000000000000000000',
    initialPrice: '1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePoolFormValues, string>>>({});

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePoolFormValues, string>> = {};

    if (!validateAddress(formValues.token0)) {
      newErrors.token0 = 'Invalid address format';
    }
    if (!validateAddress(formValues.token1)) {
      newErrors.token1 = 'Invalid address format';
    }
    if (formValues.token0.toLowerCase() === formValues.token1.toLowerCase() && formValues.token0 !== '') {
      newErrors.token1 = 'Tokens must be different';
    }
    if (!formValues.fee) {
      newErrors.fee = 'Fee tier is required';
    }
    if (!formValues.tickSpacing || parseInt(formValues.tickSpacing) <= 0) {
      newErrors.tickSpacing = 'Tick spacing must be positive';
    }
    if (formValues.hookAddress && !validateAddress(formValues.hookAddress)) {
      newErrors.hookAddress = 'Invalid hook address';
    }
    if (!formValues.initialPrice || parseFloat(formValues.initialPrice) <= 0) {
      newErrors.initialPrice = 'Initial price must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !protocolId) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, this would:
      // 1. Encode the PoolKey struct
      // 2. Calculate sqrtPriceX96 from initialPrice
      // 3. Call create_pool on the contract

      console.log('Creating pool with:', {
        protocolId: protocolId.toString(),
        poolKey: {
          currency0: formValues.token0,
          currency1: formValues.token1,
          fee: parseInt(formValues.fee),
          tickSpacing: parseInt(formValues.tickSpacing),
          hooks: formValues.hookAddress,
        },
        initialPrice: formValues.initialPrice,
      });

      // Mock success response
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPoolId = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
      const mockInitialTick = 0;

      onSuccess(mockPoolId, mockInitialTick);
    } catch (error) {
      console.error('Failed to create pool:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreatePoolFormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
              Create <span style={{ color: 'var(--color-primary)' }}>Pool</span>
            </h2>
            <p className="text-sm font-body" style={{ color: 'var(--color-black)' }}>
              Deploy a new Uniswap v4 pool for Protocol #{protocolId?.toString()}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Token Pair */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="token0" className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
                Token 0 Address
              </label>
              <input
                id="token0"
                type="text"
                value={formValues.token0}
                onChange={(e) => handleInputChange('token0', e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 font-mono text-sm angular-clip"
                style={{
                  border: `2px solid ${errors.token0 ? 'var(--color-accent)' : 'var(--color-secondary)'}`,
                  color: 'var(--color-secondary)',
                  background: 'var(--color-white)',
                }}
              />
              {errors.token0 && (
                <p className="mt-1 text-sm" style={{ color: 'var(--color-accent)' }}>{errors.token0}</p>
              )}
            </div>

            <div>
              <label htmlFor="token1" className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
                Token 1 Address
              </label>
              <input
                id="token1"
                type="text"
                value={formValues.token1}
                onChange={(e) => handleInputChange('token1', e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 font-mono text-sm angular-clip"
                style={{
                  border: `2px solid ${errors.token1 ? 'var(--color-accent)' : 'var(--color-secondary)'}`,
                  color: 'var(--color-secondary)',
                  background: 'var(--color-white)',
                }}
              />
              {errors.token1 && (
                <p className="mt-1 text-sm" style={{ color: 'var(--color-accent)' }}>{errors.token1}</p>
              )}
            </div>
          </div>

          {/* Fee Tier */}
          <div>
            <label className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
              Fee Tier
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FEE_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => handleInputChange('fee', tier.value)}
                  className="angular-clip p-4 text-left transition-all"
                  style={{
                    border: `2px solid ${formValues.fee === tier.value ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
                    background: formValues.fee === tier.value ? 'var(--color-primary)' : 'var(--color-white)',
                  }}
                >
                  <div
                    className="font-semibold font-heading"
                    style={{ color: formValues.fee === tier.value ? 'var(--color-secondary)' : 'var(--color-secondary)' }}
                  >
                    {tier.label}
                  </div>
                  <div
                    className="text-xs mt-1 font-body"
                    style={{ color: formValues.fee === tier.value ? 'var(--color-secondary)' : 'var(--color-black)' }}
                  >
                    {tier.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tick Spacing & Hook */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tickSpacing" className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
                Tick Spacing
              </label>
              <input
                id="tickSpacing"
                type="number"
                value={formValues.tickSpacing}
                onChange={(e) => handleInputChange('tickSpacing', e.target.value)}
                placeholder="60"
                className="w-full px-4 py-3 angular-clip"
                style={{
                  border: `2px solid ${errors.tickSpacing ? 'var(--color-accent)' : 'var(--color-secondary)'}`,
                  color: 'var(--color-secondary)',
                  background: 'var(--color-white)',
                }}
              />
              {errors.tickSpacing && (
                <p className="mt-1 text-sm" style={{ color: 'var(--color-accent)' }}>{errors.tickSpacing}</p>
              )}
              <p className="mt-1 text-xs font-body" style={{ color: 'var(--color-black)' }}>
                Determines price granularity. Common values: 1, 10, 60, 200
              </p>
            </div>

            <div>
              <label htmlFor="hookAddress" className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
                Hook Address (Optional)
              </label>
              <input
                id="hookAddress"
                type="text"
                value={formValues.hookAddress}
                onChange={(e) => handleInputChange('hookAddress', e.target.value)}
                placeholder="0x0000...0000"
                className="w-full px-4 py-3 font-mono text-sm angular-clip"
                style={{
                  border: `2px solid ${errors.hookAddress ? 'var(--color-accent)' : 'var(--color-secondary)'}`,
                  color: 'var(--color-secondary)',
                  background: 'var(--color-white)',
                }}
              />
              {errors.hookAddress && (
                <p className="mt-1 text-sm" style={{ color: 'var(--color-accent)' }}>{errors.hookAddress}</p>
              )}
              <p className="mt-1 text-xs font-body" style={{ color: 'var(--color-black)' }}>
                Leave as zero address for no hook
              </p>
            </div>
          </div>

          {/* Initial Price */}
          <div>
            <label htmlFor="initialPrice" className="block text-sm font-medium font-heading mb-2" style={{ color: 'var(--color-secondary)' }}>
              Initial Price (Token1/Token0)
            </label>
            <input
              id="initialPrice"
              type="text"
              value={formValues.initialPrice}
              onChange={(e) => handleInputChange('initialPrice', e.target.value)}
              placeholder="1.0"
              className="w-full px-4 py-3 angular-clip"
              style={{
                border: `2px solid ${errors.initialPrice ? 'var(--color-accent)' : 'var(--color-secondary)'}`,
                color: 'var(--color-secondary)',
                background: 'var(--color-white)',
              }}
            />
            {errors.initialPrice && (
              <p className="mt-1 text-sm" style={{ color: 'var(--color-accent)' }}>{errors.initialPrice}</p>
            )}
            <p className="mt-1 text-xs font-body" style={{ color: 'var(--color-black)' }}>
              The starting price ratio between the two tokens
            </p>
          </div>

          {/* Info Box */}
          <div className="angular-clip p-4 flex gap-3" style={{ background: 'var(--color-marble-light)', border: '2px solid var(--color-secondary)' }}>
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-secondary)' }} />
            <div className="text-sm" style={{ color: 'var(--color-secondary)' }}>
              <p className="font-medium font-heading mb-1">Before creating a pool:</p>
              <ul className="list-disc list-inside space-y-1 font-body" style={{ color: 'var(--color-black)' }}>
                <li>Ensure both token contracts are deployed and verified</li>
                <li>Token0 address must be less than Token1 (sorted)</li>
                <li>Hook address must match the pool's hook permissions</li>
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
            disabled={isSubmitting || !protocolId}
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
                Creating Pool...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Pool
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoolForm;
