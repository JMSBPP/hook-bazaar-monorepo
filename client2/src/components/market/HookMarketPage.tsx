import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HookBrowser from './HookBrowser';
import HookLens from './HookLens';
import BytecodeVerifier from './BytecodeVerifier';
import FunctionalityTester from './FunctionalityTester';
import {
  HookListingSummary,
  HookListing,
  HookSpec,
  BytecodeVerificationResult,
  FunctionalityTestResult,
} from '../../types/hookSpec';

// Mock hook listings for browsing - replace with actual API calls
const mockHooks: HookListingSummary[] = [
  {
    tokenId: 1,
    name: 'Dynamic Fee Hook',
    version: '1.2.0',
    description: 'Implements dynamic trading fees based on market volatility using a TWAP oracle.',
    category: 'FEE_MANAGEMENT',
    developer: '0x1234567890abcdef1234567890abcdef12345678',
    pricing: {
      model: 'FIXED',
      fixedPrice: '100000000000000000',
      currency: '0x0000000000000000000000000000000000000000',
    },
    complianceScore: 98,
    verified: true,
    cfheDeployed: true,
    subscriptionCount: 45,
    registeredAt: '2024-01-15T10:30:00Z',
    tags: ['fee', 'dynamic', 'volatility', 'twap'],
  },
  {
    tokenId: 2,
    name: 'TWAP Oracle Hook',
    version: '2.0.1',
    description: 'Time-weighted average price oracle for accurate on-chain price feeds.',
    category: 'ORACLE',
    developer: '0xabcdef1234567890abcdef1234567890abcdef12',
    pricing: {
      model: 'REVENUE_SHARE',
      revenueShareBps: 50,
      currency: '0x0000000000000000000000000000000000000000',
    },
    complianceScore: 95,
    verified: true,
    cfheDeployed: true,
    subscriptionCount: 32,
    registeredAt: '2024-02-20T14:15:00Z',
    tags: ['oracle', 'twap', 'price'],
  },
  {
    tokenId: 3,
    name: 'Limit Order Hook',
    version: '1.0.0',
    description: 'Enables limit orders and stop-loss functionality on Uniswap v4 pools.',
    category: 'LIMIT_ORDER',
    developer: '0x9876543210fedcba9876543210fedcba98765432',
    pricing: {
      model: 'HYBRID',
      fixedPrice: '50000000000000000',
      revenueShareBps: 25,
      currency: '0x0000000000000000000000000000000000000000',
    },
    complianceScore: 92,
    verified: true,
    cfheDeployed: false,
    subscriptionCount: 18,
    registeredAt: '2024-03-10T09:00:00Z',
    tags: ['limit', 'order', 'stop-loss'],
  },
  {
    tokenId: 4,
    name: 'LP Incentive Hook',
    version: '1.1.0',
    description: 'Provides liquidity provider incentives through automatic reward distribution.',
    category: 'LIQUIDITY',
    developer: '0xfedcba9876543210fedcba9876543210fedcba98',
    pricing: {
      model: 'FIXED',
      fixedPrice: '200000000000000000',
      currency: '0x0000000000000000000000000000000000000000',
    },
    complianceScore: 88,
    verified: true,
    cfheDeployed: true,
    subscriptionCount: 27,
    registeredAt: '2024-03-25T16:45:00Z',
    tags: ['liquidity', 'incentive', 'rewards'],
  },
  {
    tokenId: 5,
    name: 'MEV Shield Hook',
    version: '0.9.0',
    description: 'Protects traders from MEV extraction through commit-reveal schemes.',
    category: 'MEV_PROTECTION',
    developer: '0x1111222233334444555566667777888899990000',
    pricing: {
      model: 'REVENUE_SHARE',
      revenueShareBps: 100,
      currency: '0x0000000000000000000000000000000000000000',
    },
    complianceScore: 75,
    verified: false,
    cfheDeployed: false,
    subscriptionCount: 8,
    registeredAt: '2024-04-01T11:30:00Z',
    tags: ['mev', 'protection', 'security'],
  },
  {
    tokenId: 6,
    name: 'Custom Analytics Hook',
    version: '1.0.0',
    description: 'Emits detailed analytics events for pool monitoring and dashboards.',
    category: 'CUSTOM',
    developer: '0xaaaabbbbccccddddeeeeffffgggghhhhiiiijjjj',
    pricing: {
      model: 'FIXED',
      fixedPrice: '25000000000000000',
      currency: '0x0000000000000000000000000000000000000000',
    },
    complianceScore: 90,
    verified: true,
    cfheDeployed: false,
    subscriptionCount: 12,
    registeredAt: '2024-04-15T08:00:00Z',
    tags: ['analytics', 'events', 'monitoring'],
  },
];

// Mock detailed hook data - replace with actual API calls
const mockHookDetails: Record<number, HookListing> = {
  1: {
    tokenId: 1,
    developer: '0x1234567890abcdef1234567890abcdef12345678',
    registeredAt: '2024-01-15T10:30:00Z',
    deprecated: false,
    pricing: {
      model: 'FIXED',
      fixedPrice: '100000000000000000',
      currency: '0x0000000000000000000000000000000000000000',
    },
    metadata: {
      name: 'Dynamic Fee Hook',
      version: '1.2.0',
      description: 'Implements dynamic trading fees based on market volatility using a TWAP oracle. Fees automatically adjust to protect liquidity providers during high volatility periods.',
      category: 'FEE_MANAGEMENT',
      tags: ['fee', 'dynamic', 'volatility', 'twap'],
      capabilities: [
        { callback: 'beforeSwap', description: 'Calculates and applies dynamic fee based on volatility' },
        { callback: 'afterSwap', description: 'Updates TWAP oracle with new price data' },
      ],
    },
    verification: {
      codeVerified: true,
      avsAttestationId: 'avs-123456',
      complianceScore: 98,
      cfheDeployed: true,
      cfheContractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    },
    spec: {
      metadata: {
        name: 'Dynamic Fee Hook',
        version: '1.2.0',
        author: 'HookLabs',
        description: 'Dynamic fee based on volatility',
        license: 'MIT',
      },
      hook_state: [
        { name: 'lastTwapPrice', symbol: 'P_twap', type: 'uint256', description: 'Last recorded TWAP price' },
        { name: 'volatility', symbol: 'V', type: 'uint256', description: 'Current volatility measurement' },
      ],
      system_functions: [
        {
          callback: 'beforeSwap',
          reads: ['P_twap', 'V'],
          writes: [],
          transition: {
            preconditions: ['V >= 0'],
            equation: 'fee = base_fee + (V * fee_multiplier)',
            postconditions: ['fee <= max_fee'],
          },
        },
      ],
      invariants: [
        { name: 'fee_bounds', expression: 'fee >= min_fee && fee <= max_fee', description: 'Fee must stay within bounds' },
      ],
    },
  },
};

const HookMarketPage: React.FC = () => {
  const navigate = useNavigate();

  // State for selected hook and modals
  const [selectedHook, setSelectedHook] = useState<HookListing | null>(null);
  const [showHookLens, setShowHookLens] = useState(false);
  const [showBytecodeVerifier, setShowBytecodeVerifier] = useState(false);
  const [showFunctionalityTester, setShowFunctionalityTester] = useState(false);

  // State for verification and test results
  const [bytecodeResult, setBytecodeResult] = useState<BytecodeVerificationResult | null>(null);
  const [testResult, setTestResult] = useState<FunctionalityTestResult | null>(null);

  const handleSelectHook = (hook: HookListingSummary) => {
    // In production, fetch full hook details from API
    const fullHook = mockHookDetails[hook.tokenId] || {
      tokenId: hook.tokenId,
      developer: hook.developer,
      registeredAt: hook.registeredAt,
      deprecated: false,
      pricing: hook.pricing,
      metadata: {
        name: hook.name,
        version: hook.version,
        description: hook.description || '',
        category: hook.category,
        tags: hook.tags || [],
        capabilities: [],
      },
      verification: {
        codeVerified: hook.verified,
        complianceScore: hook.complianceScore,
        cfheDeployed: hook.cfheDeployed,
      },
    };

    setSelectedHook(fullHook);
    setShowHookLens(true);
  };

  const handleVerifyBytecode = () => {
    setShowHookLens(false);
    setShowBytecodeVerifier(true);
  };

  const handleTestFunctionality = () => {
    setShowHookLens(false);
    setShowFunctionalityTester(true);
  };

  const handleSubscribe = async (poolId: string) => {
    if (!selectedHook) return;

    // In production, this would generate and execute the addHook transaction
    console.log('Subscribing to hook', selectedHook.tokenId, 'for pool', poolId);

    // Mock transaction flow
    alert(`Subscription initiated for hook ${selectedHook.metadata.name} on pool ${poolId}`);
    setShowHookLens(false);
  };

  const handleBytecodeVerificationComplete = (result: BytecodeVerificationResult) => {
    setBytecodeResult(result);
  };

  const handleTestComplete = (result: FunctionalityTestResult) => {
    setTestResult(result);
  };

  const handleCloseBytecodeVerifier = () => {
    setShowBytecodeVerifier(false);
    setShowHookLens(true);
  };

  const handleCloseFunctionalityTester = () => {
    setShowFunctionalityTester(false);
    setShowHookLens(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/protocol-designer')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hook Marketplace</h1>
                <p className="text-sm text-gray-500">
                  Browse, verify, and subscribe to hooks for your pools
                </p>
              </div>
            </div>

            {/* Verification Status Summary */}
            {(bytecodeResult || testResult) && (
              <div className="flex items-center gap-4">
                {bytecodeResult && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    bytecodeResult.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bytecodeResult.verified ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    Bytecode {bytecodeResult.verified ? 'Verified' : 'Mismatch'}
                  </div>
                )}
                {testResult && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    testResult.accuracyScore >= 90 ? 'bg-green-100 text-green-800' :
                    testResult.accuracyScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    AVS Score: {testResult.accuracyScore}%
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HookBrowser hooks={mockHooks} onSelectHook={handleSelectHook} />
      </main>

      {/* Hook Lens Modal */}
      {showHookLens && selectedHook && (
        <HookLens
          hook={selectedHook}
          onClose={() => {
            setShowHookLens(false);
            setSelectedHook(null);
          }}
          onVerifyBytecode={handleVerifyBytecode}
          onTestFunctionality={handleTestFunctionality}
          onSubscribe={handleSubscribe}
        />
      )}

      {/* Bytecode Verifier Modal */}
      {showBytecodeVerifier && selectedHook && (
        <BytecodeVerifier
          hookTokenId={selectedHook.tokenId}
          hookName={selectedHook.metadata.name}
          onClose={handleCloseBytecodeVerifier}
          onVerificationComplete={handleBytecodeVerificationComplete}
        />
      )}

      {/* Functionality Tester Modal */}
      {showFunctionalityTester && selectedHook && (
        <FunctionalityTester
          hookTokenId={selectedHook.tokenId}
          hookName={selectedHook.metadata.name}
          onClose={handleCloseFunctionalityTester}
          onTestComplete={handleTestComplete}
        />
      )}
    </div>
  );
};

export default HookMarketPage;
