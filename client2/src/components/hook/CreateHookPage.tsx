import { useState, useCallback } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Navigation';
import Footer from '../Footer';
import StateSpaceModelViewer from './StateSpaceModelViewer';
import HookSpecEditor from './HookSpecEditor';
import ValidationResults from './ValidationResults';
import SubmissionFlow from './SubmissionFlow';
import type {
  HookSpec,
  StateSpaceModel,
  ValidationResult,
  SubmissionResult,
  SystemStateVariable
} from '../../types/hookSpec';

interface CreateHookPageProps {
  onNavigate?: (page: string) => void;
}

type FlowStep = 'view-model' | 'edit-spec' | 'validate' | 'submit';

const STEPS: { id: FlowStep; title: string; description: string }[] = [
  {
    id: 'view-model',
    title: 'View State Model',
    description: 'Review available pool state variables'
  },
  {
    id: 'edit-spec',
    title: 'Write HookSpec',
    description: 'Define your hook behavior'
  },
  {
    id: 'validate',
    title: 'Validate',
    description: 'Check compatibility'
  },
  {
    id: 'submit',
    title: 'Submit',
    description: 'Mint HookLicense NFT'
  }
];

// Mock data - replace with API calls
const MOCK_STATE_SPACE_MODEL: StateSpaceModel = {
  version: '1.0.0',
  ipfsCid: 'QmSystemStateModelV1abc123def456',
  uniswapVersion: 'v4',
  updatedAt: '2025-12-09',
  indices: {
    lp: [
      {
        name: 'position_liquidity',
        symbol: 'L_k',
        type: 'uint128',
        getter: 'getPositionLiquidity(poolId, positionId)',
        description: 'Liquidity amount for a specific position'
      },
      {
        name: 'tick_lower',
        symbol: 't_l^k',
        type: 'int24',
        getter: 'getPositionInfo(poolId, positionId)',
        description: 'Lower tick bound of position'
      },
      {
        name: 'tick_upper',
        symbol: 't_u^k',
        type: 'int24',
        getter: 'getPositionInfo(poolId, positionId)',
        description: 'Upper tick bound of position'
      },
      {
        name: 'fee_growth_inside_0',
        symbol: 'f_{0,k}^{in}',
        type: 'uint256',
        getter: 'getPositionInfo(poolId, positionId)',
        description: 'Fee growth inside position for token0'
      },
      {
        name: 'fee_growth_inside_1',
        symbol: 'f_{1,k}^{in}',
        type: 'uint256',
        getter: 'getPositionInfo(poolId, positionId)',
        description: 'Fee growth inside position for token1'
      },
      {
        name: 'liquidity_gross',
        symbol: 'L_g^{tick}',
        type: 'uint128',
        getter: 'getTickLiquidity(poolId, tick)',
        description: 'Gross liquidity at tick'
      },
      {
        name: 'liquidity_net',
        symbol: 'L_n^{tick}',
        type: 'int128',
        getter: 'getTickLiquidity(poolId, tick)',
        description: 'Net liquidity change at tick'
      }
    ],
    trader: [
      {
        name: 'sqrt_price',
        symbol: '\\sqrt{P}',
        type: 'uint160',
        getter: 'getSlot0(poolId)',
        description: 'Current sqrt price in Q64.96 format'
      },
      {
        name: 'current_tick',
        symbol: 't_c',
        type: 'int24',
        getter: 'getSlot0(poolId)',
        description: 'Current tick index'
      },
      {
        name: 'lp_fee',
        symbol: '\\phi_{lp}',
        type: 'uint24',
        getter: 'getSlot0(poolId)',
        description: 'Fee paid to liquidity providers'
      },
      {
        name: 'protocol_fee',
        symbol: '\\phi_{proto}',
        type: 'uint24',
        getter: 'getSlot0(poolId)',
        description: 'Protocol fee percentage'
      },
      {
        name: 'active_liquidity',
        symbol: 'L_{act}',
        type: 'uint128',
        getter: 'getLiquidity(poolId)',
        description: 'Currently active liquidity for swaps'
      },
      {
        name: 'tick_bitmap',
        symbol: 'B_{tick}',
        type: 'uint256',
        getter: 'getTickBitmap(poolId, wordPos)',
        description: 'Bitmap for initialized ticks'
      }
    ],
    shared: [
      {
        name: 'fee_growth_global_0',
        symbol: 'f_0^{global}',
        type: 'uint256',
        getter: 'getFeeGrowthGlobals(poolId)',
        description: 'Cumulative fee growth for token0'
      },
      {
        name: 'fee_growth_global_1',
        symbol: 'f_1^{global}',
        type: 'uint256',
        getter: 'getFeeGrowthGlobals(poolId)',
        description: 'Cumulative fee growth for token1'
      }
    ]
  }
};

export default function CreateHookPage({ onNavigate }: CreateHookPageProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FlowStep>('view-model');
  const [hookSpec, setHookSpec] = useState<HookSpec | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationPassed, setValidationPassed] = useState(false);

  // Mock wallet state - replace with actual wallet integration
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigate(`/${page}`);
    }
  };

  const handleSelectVariable = useCallback((variable: SystemStateVariable) => {
    // Could open a tooltip or copy to clipboard
    console.log('Selected variable:', variable);
  }, []);

  const handleSpecChange = useCallback((spec: HookSpec) => {
    setHookSpec(spec);
    // Reset validation when spec changes
    setValidationResults([]);
    setValidationPassed(false);
  }, []);

  const handleValidate = useCallback(async () => {
    if (!hookSpec) return;

    setIsValidating(true);
    setValidationResults([]);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation results
    const mockResults: ValidationResult[] = [
      {
        ruleId: 'V1',
        ruleName: 'ValidPoolStateReferences',
        passed: true,
        errors: [],
        warnings: []
      },
      {
        ruleId: 'V2',
        ruleName: 'UniqueHookStateNames',
        passed: hookSpec.hook_state.length === new Set(hookSpec.hook_state.map(v => v.name)).size,
        errors: hookSpec.hook_state.length !== new Set(hookSpec.hook_state.map(v => v.name)).size
          ? ['Duplicate hook state variable names detected']
          : [],
        warnings: []
      },
      {
        ruleId: 'V3',
        ruleName: 'ValidCallbacks',
        passed: true,
        errors: [],
        warnings: []
      },
      {
        ruleId: 'V4',
        ruleName: 'ValidEquationSymbols',
        passed: true,
        errors: [],
        warnings: hookSpec.system_functions.some(f => !f.transition.equation)
          ? ['Some functions are missing transition equations']
          : []
      },
      {
        ruleId: 'V5',
        ruleName: 'ValidSolidityTypes',
        passed: true,
        errors: [],
        warnings: []
      },
      {
        ruleId: 'V6',
        ruleName: 'WritesMatchHookState',
        passed: true,
        errors: [],
        warnings: []
      }
    ];

    setValidationResults(mockResults);
    setValidationPassed(mockResults.every(r => r.passed));
    setIsValidating(false);
    setCurrentStep('validate');
  }, [hookSpec]);

  const handleSubmit = useCallback(async (): Promise<SubmissionResult> => {
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      ipfsCid: 'QmNewHookSpec' + Math.random().toString(36).slice(2, 10),
      tokenId: Math.floor(Math.random() * 1000) + 1,
      transactionHash: '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
      ownerAddress: walletAddress || '0x0000000000000000000000000000000000000000',
      ipfsGatewayUrl: 'https://ipfs.io/ipfs/QmNewHookSpec...',
      openSeaUrl: 'https://opensea.io/assets/ethereum/...'
    };
  }, [walletAddress]);

  const handleConnectWallet = useCallback(() => {
    // Simulate wallet connection
    setWalletConnected(true);
    setWalletAddress('0x1234567890abcdef1234567890abcdef12345678');
  }, []);

  const goToStep = (step: FlowStep) => {
    // Only allow going back or to already completed steps
    const stepOrder: FlowStep[] = ['view-model', 'edit-spec', 'validate', 'submit'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);

    if (targetIndex <= currentIndex || (step === 'submit' && validationPassed)) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    const stepOrder: FlowStep[] = ['view-model', 'edit-spec', 'validate', 'submit'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-white)' }}>
      <Navigation onNavigate={handleNavigate} />

      {/* Hero Section */}
      <section
        className="speed-lines"
        style={{
          paddingTop: 'var(--space-2xl)',
          paddingBottom: 'var(--space-xl)',
          background: 'var(--color-marble-light)'
        }}
      >
        <div className="container-custom">
          <button
            onClick={() => handleNavigate('hook-developer')}
            className="flex items-center gap-2 mb-6 font-heading transition-colors duration-200"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <h1
            className="mb-2 font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Create New <span style={{ color: 'var(--color-primary)' }}>Hook</span>
          </h1>
          <p
            className="font-body"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body)'
            }}
          >
            Define your hook specification and mint a HookLicense NFT
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-lg)' }}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const stepOrder: FlowStep[] = ['view-model', 'edit-spec', 'validate', 'submit'];
              const currentIndex = stepOrder.indexOf(currentStep);
              const stepIndex = stepOrder.indexOf(step.id);
              const isActive = step.id === currentStep;
              const isCompleted = stepIndex < currentIndex;
              const isAccessible = stepIndex <= currentIndex || (step.id === 'submit' && validationPassed);

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    disabled={!isAccessible}
                    className="flex items-center gap-3 transition-all duration-200"
                    style={{
                      cursor: isAccessible ? 'pointer' : 'not-allowed',
                      opacity: isAccessible ? 1 : 0.5
                    }}
                  >
                    <div
                      className="angular-clip w-10 h-10 flex items-center justify-center font-heading"
                      style={{
                        background: isActive
                          ? 'var(--color-primary)'
                          : isCompleted
                          ? 'var(--color-secondary)'
                          : 'var(--color-marble-light)',
                        color: isActive || isCompleted
                          ? isActive ? 'var(--color-secondary)' : 'var(--color-primary)'
                          : 'var(--color-accent)',
                        border: `2px solid ${isActive ? 'var(--color-secondary)' : 'var(--color-accent)'}`,
                        fontSize: 'var(--font-size-body)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="hidden md:block text-left">
                      <p
                        className="font-heading"
                        style={{
                          color: isActive ? 'var(--color-secondary)' : 'var(--color-accent)',
                          fontSize: 'var(--font-size-body-sm)',
                          fontWeight: 'var(--font-weight-bold)'
                        }}
                      >
                        {step.title}
                      </p>
                      <p
                        className="font-body"
                        style={{
                          color: 'var(--color-black)',
                          fontSize: 'var(--font-size-caption)'
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </button>

                  {index < STEPS.length - 1 && (
                    <ChevronRight
                      size={24}
                      className="mx-4 hidden md:block"
                      style={{ color: 'var(--color-accent)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ paddingBottom: 'var(--space-4xl)' }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - State Space Model (Always visible) */}
            <div className={currentStep === 'view-model' ? 'lg:col-span-3' : 'lg:col-span-1'}>
              <StateSpaceModelViewer
                model={MOCK_STATE_SPACE_MODEL}
                onSelectVariable={handleSelectVariable}
                compact={currentStep !== 'view-model'}
              />

              {currentStep === 'view-model' && (
                <button
                  onClick={nextStep}
                  className="angular-clip-button w-full mt-4 px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'var(--color-secondary)',
                    border: '2px solid var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  Continue to HookSpec Editor
                </button>
              )}
            </div>

            {/* Right Panel - Editor/Validation/Submission */}
            {currentStep !== 'view-model' && (
              <div className="lg:col-span-2 space-y-6">
                {(currentStep === 'edit-spec' || currentStep === 'validate') && (
                  <HookSpecEditor
                    initialSpec={hookSpec || undefined}
                    stateSpaceModel={MOCK_STATE_SPACE_MODEL}
                    onChange={handleSpecChange}
                    onValidate={handleValidate}
                    isValidating={isValidating}
                  />
                )}

                {currentStep === 'validate' && (
                  <>
                    <ValidationResults
                      results={validationResults}
                      isLoading={isValidating}
                    />

                    {validationPassed && (
                      <button
                        onClick={() => setCurrentStep('submit')}
                        className="angular-clip-button w-full px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200"
                        style={{
                          background: 'var(--color-primary)',
                          color: 'var(--color-secondary)',
                          border: '2px solid var(--color-secondary)',
                          fontSize: 'var(--font-size-body-sm)',
                          fontWeight: 'var(--font-weight-bold)'
                        }}
                      >
                        Continue to Submission
                      </button>
                    )}
                  </>
                )}

                {currentStep === 'submit' && hookSpec && (
                  <SubmissionFlow
                    hookSpec={hookSpec}
                    validationPassed={validationPassed}
                    onSubmit={handleSubmit}
                    walletConnected={walletConnected}
                    walletAddress={walletAddress}
                    onConnectWallet={handleConnectWallet}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
