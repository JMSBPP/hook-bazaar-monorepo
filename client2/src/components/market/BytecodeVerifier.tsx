import React, { useState } from 'react';
import {
  BytecodeVerificationRequest,
  BytecodeVerificationResult,
  EncryptionStatus,
} from '../../types/hookSpec';

interface BytecodeVerifierProps {
  hookTokenId: number;
  hookName: string;
  onClose: () => void;
  onVerificationComplete?: (result: BytecodeVerificationResult) => void;
}

const BytecodeVerifier: React.FC<BytecodeVerifierProps> = ({
  hookTokenId,
  hookName,
  onClose,
  onVerificationComplete,
}) => {
  const [poolId, setPoolId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<BytecodeVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const request: BytecodeVerificationRequest = {
        hookTokenId,
        poolId: poolId || undefined,
      };

      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock result
      const mockResult: BytecodeVerificationResult = {
        verified: true,
        obfuscatedBytecodeHash: '0x7f8e9d2c1a4b5e6f0123456789abcdef...',
        deployedBytecodeHash: '0x7f8e9d2c1a4b5e6f0123456789abcdef...',
        matchPercentage: 100,
        cfheContractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        encryptionStatus: 'ENCRYPTED' as EncryptionStatus,
      };

      setResult(mockResult);
      onVerificationComplete?.(mockResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const getEncryptionStatusBadge = (status: EncryptionStatus) => {
    const styles: Record<EncryptionStatus, { bg: string; text: string }> = {
      ENCRYPTED: { bg: 'bg-green-100', text: 'text-green-800' },
      PLAINTEXT: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      NOT_DEPLOYED: { bg: 'bg-gray-100', text: 'text-gray-800' },
    };
    const style = styles[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getMatchIndicator = (percentage: number) => {
    if (percentage === 100) {
      return { color: 'text-green-600', icon: 'check-circle', label: 'Perfect Match' };
    } else if (percentage >= 90) {
      return { color: 'text-yellow-600', icon: 'alert-circle', label: 'Partial Match' };
    } else {
      return { color: 'text-red-600', icon: 'x-circle', label: 'Mismatch' };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bytecode Verification
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Verify deployed code matches registered bytecode for {hookName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pool Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pool ID (Optional)
            </label>
            <input
              type="text"
              value={poolId}
              onChange={(e) => setPoolId(e.target.value)}
              placeholder="0x... (leave empty for general verification)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isVerifying}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optionally specify a pool ID to verify deployment for a specific pool
            </p>
          </div>

          {/* Verify Button */}
          {!result && (
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying Bytecode...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Bytecode
                </>
              )}
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Verification Failed</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Verification Result */}
          {result && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg ${
                  result.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.verified ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <h3 className={`font-semibold ${result.verified ? 'text-green-800' : 'text-red-800'}`}>
                      {result.verified ? 'Bytecode Verified' : 'Bytecode Mismatch'}
                    </h3>
                    <p className={`text-sm ${result.verified ? 'text-green-700' : 'text-red-700'}`}>
                      {result.verified
                        ? 'The deployed code matches the registered hook bytecode'
                        : 'The deployed code does not match the registered bytecode'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Match Percentage */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Match Percentage</span>
                  <span className={`text-lg font-bold ${getMatchIndicator(result.matchPercentage).color}`}>
                    {result.matchPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      result.matchPercentage === 100
                        ? 'bg-green-500'
                        : result.matchPercentage >= 90
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${result.matchPercentage}%` }}
                  />
                </div>
              </div>

              {/* Bytecode Hashes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Obfuscated Bytecode Hash (CFHE)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-xs text-gray-700 break-all">
                      {result.obfuscatedBytecodeHash}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.obfuscatedBytecodeHash)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Deployed Bytecode Hash
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-xs text-gray-700 break-all">
                      {result.deployedBytecodeHash}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.deployedBytecodeHash)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* CFHE Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">CFHE Deployment Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Encryption Status</span>
                    {getEncryptionStatusBadge(result.encryptionStatus)}
                  </div>
                  {result.cfheContractAddress && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CFHE Contract</span>
                      <a
                        href={`https://explorer.fhenix.zone/address/${result.cfheContractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {result.cfheContractAddress.slice(0, 6)}...{result.cfheContractAddress.slice(-4)}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setResult(null)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Verify Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Bytecode verification confirms that the deployed hook code matches the registered
            obfuscated bytecode stored on the CFHE network. This ensures code integrity and
            prevents tampering.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BytecodeVerifier;
