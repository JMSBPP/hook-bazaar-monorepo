import { useState } from 'react';
import {
  Upload,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  Wallet,
  FileText,
  Award
} from 'lucide-react';
import type { HookSpec, SubmissionResult } from '../../types/hookSpec';

interface SubmissionFlowProps {
  hookSpec: HookSpec;
  validationPassed: boolean;
  onSubmit: () => Promise<SubmissionResult>;
  walletConnected: boolean;
  walletAddress?: string;
  onConnectWallet: () => void;
}

type SubmissionStep = 'idle' | 'signing' | 'uploading' | 'minting' | 'complete' | 'error';

interface StepConfig {
  id: SubmissionStep;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    id: 'signing',
    title: 'Sign Message',
    description: 'Confirm your intent to register this HookSpec',
    icon: <Wallet size={24} />
  },
  {
    id: 'uploading',
    title: 'Upload to IPFS',
    description: 'Storing your specification on decentralized storage',
    icon: <Upload size={24} />
  },
  {
    id: 'minting',
    title: 'Mint License',
    description: 'Creating your HookLicense NFT',
    icon: <Award size={24} />
  }
];

export default function SubmissionFlow({
  hookSpec,
  validationPassed,
  onSubmit,
  walletConnected,
  walletAddress,
  onConnectWallet
}: SubmissionFlowProps) {
  const [currentStep, setCurrentStep] = useState<SubmissionStep>('idle');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    try {
      // Step 1: Signing
      setCurrentStep('signing');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate signing

      // Step 2: Uploading
      setCurrentStep('uploading');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload

      // Step 3: Minting
      setCurrentStep('minting');

      // Actually call the submit function
      const submissionResult = await onSubmit();

      setResult(submissionResult);
      setCurrentStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setCurrentStep('error');
    }
  };

  const resetFlow = () => {
    setCurrentStep('idle');
    setResult(null);
    setError(null);
  };

  const getStepStatus = (stepId: SubmissionStep): 'pending' | 'active' | 'complete' => {
    const stepOrder: SubmissionStep[] = ['signing', 'uploading', 'minting'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentStep === 'complete') return 'complete';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  // Idle state - show submit button
  if (currentStep === 'idle') {
    return (
      <div
        className="angular-clip p-6"
        style={{
          background: 'var(--color-white)',
          border: '2px solid var(--color-secondary)'
        }}
      >
        <h3
          className="font-heading mb-4"
          style={{
            color: 'var(--color-secondary)',
            fontSize: 'var(--font-size-h4)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          Submit HookSpec
        </h3>

        {!walletConnected ? (
          <div className="text-center py-6">
            <Wallet size={48} style={{ color: 'var(--color-accent)', margin: '0 auto' }} />
            <p
              className="font-body mt-4 mb-6"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body)'
              }}
            >
              Connect your wallet to submit your HookSpec
            </p>
            <button
              onClick={onConnectWallet}
              className="angular-clip-button px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-secondary)',
                border: '2px solid var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              Connect Wallet
            </button>
          </div>
        ) : !validationPassed ? (
          <div
            className="angular-clip p-4 flex items-center gap-3"
            style={{
              background: 'rgba(232, 90, 79, 0.1)',
              border: '1px solid var(--color-accent)'
            }}
          >
            <XCircle size={24} style={{ color: 'var(--color-accent)' }} />
            <div>
              <p
                className="font-heading"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Validation Required
              </p>
              <p
                className="font-body"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                Your HookSpec must pass validation before submission
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div
              className="angular-clip p-4 mb-6"
              style={{
                background: 'var(--color-marble-light)',
                border: '1px solid var(--color-accent)'
              }}
            >
              <div className="flex items-start gap-3">
                <FileText size={24} style={{ color: 'var(--color-primary)' }} />
                <div className="flex-1">
                  <h4
                    className="font-heading"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    {hookSpec.metadata.name}
                  </h4>
                  <p
                    className="font-mono"
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: 'var(--font-size-caption)'
                    }}
                  >
                    v{hookSpec.metadata.version}
                  </p>
                  {hookSpec.metadata.description && (
                    <p
                      className="font-body mt-2"
                      style={{
                        color: 'var(--color-black)',
                        fontSize: 'var(--font-size-body-sm)'
                      }}
                    >
                      {hookSpec.metadata.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 grid grid-cols-3 gap-4" style={{ borderTop: '1px solid var(--color-accent)' }}>
                <div>
                  <span
                    className="font-heading"
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: 'var(--font-size-caption)',
                      textTransform: 'uppercase'
                    }}
                  >
                    State Vars
                  </span>
                  <p
                    className="font-heading mt-1"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-h5)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    {hookSpec.hook_state.length}
                  </p>
                </div>
                <div>
                  <span
                    className="font-heading"
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: 'var(--font-size-caption)',
                      textTransform: 'uppercase'
                    }}
                  >
                    Functions
                  </span>
                  <p
                    className="font-heading mt-1"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-h5)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    {hookSpec.system_functions.length}
                  </p>
                </div>
                <div>
                  <span
                    className="font-heading"
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: 'var(--font-size-caption)',
                      textTransform: 'uppercase'
                    }}
                  >
                    Invariants
                  </span>
                  <p
                    className="font-heading mt-1"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-h5)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    {hookSpec.invariants?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Connected Wallet */}
            <div
              className="angular-clip p-3 mb-6 flex items-center justify-between"
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid var(--color-primary)'
              }}
            >
              <div className="flex items-center gap-2">
                <Wallet size={18} style={{ color: 'var(--color-primary)' }} />
                <span
                  className="font-body"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)'
                  }}
                >
                  Connected:
                </span>
                <code
                  className="font-mono"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                >
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </code>
              </div>
              <CheckCircle size={18} style={{ color: 'var(--color-primary)' }} />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="angular-clip-button w-full px-6 py-4 font-heading uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-secondary)',
                border: '2px solid var(--color-secondary)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              <Upload size={20} />
              Submit & Mint HookLicense
            </button>
          </>
        )}
      </div>
    );
  }

  // Progress state - show steps
  if (['signing', 'uploading', 'minting'].includes(currentStep)) {
    return (
      <div
        className="angular-clip p-6"
        style={{
          background: 'var(--color-white)',
          border: '2px solid var(--color-secondary)'
        }}
      >
        <h3
          className="font-heading mb-6 text-center"
          style={{
            color: 'var(--color-secondary)',
            fontSize: 'var(--font-size-h4)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          Submitting HookSpec...
        </h3>

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.id);

            return (
              <div
                key={step.id}
                className="angular-clip p-4 flex items-center gap-4"
                style={{
                  background: status === 'active'
                    ? 'var(--color-primary)'
                    : status === 'complete'
                    ? 'rgba(255, 215, 0, 0.1)'
                    : 'var(--color-marble-light)',
                  border: `2px solid ${status === 'active' ? 'var(--color-secondary)' : 'var(--color-accent)'}`
                }}
              >
                <div
                  className="angular-clip w-12 h-12 flex items-center justify-center"
                  style={{
                    background: status === 'complete'
                      ? 'var(--color-primary)'
                      : status === 'active'
                      ? 'var(--color-secondary)'
                      : 'var(--color-accent)',
                    color: status === 'active' ? 'var(--color-primary)' : 'var(--color-white)'
                  }}
                >
                  {status === 'complete' ? (
                    <CheckCircle size={24} style={{ color: 'var(--color-secondary)' }} />
                  ) : status === 'active' ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>

                <div className="flex-1">
                  <h4
                    className="font-heading"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    {step.title}
                  </h4>
                  <p
                    className="font-body"
                    style={{
                      color: status === 'active' ? 'var(--color-secondary)' : 'var(--color-black)',
                      fontSize: 'var(--font-size-body-sm)'
                    }}
                  >
                    {step.description}
                  </p>
                </div>

                <span
                  className="angular-clip px-3 py-1 font-heading"
                  style={{
                    background: status === 'complete'
                      ? 'var(--color-primary)'
                      : status === 'active'
                      ? 'var(--color-secondary)'
                      : 'var(--color-accent)',
                    color: status === 'active' ? 'var(--color-primary)' : 'var(--color-white)',
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 'var(--font-weight-bold)',
                    textTransform: 'uppercase'
                  }}
                >
                  {status === 'complete' ? 'Done' : status === 'active' ? 'In Progress' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Complete state
  if (currentStep === 'complete' && result) {
    return (
      <div
        className="angular-clip p-6"
        style={{
          background: 'var(--color-primary)',
          border: '2px solid var(--color-secondary)'
        }}
      >
        <div className="text-center mb-6">
          <CheckCircle
            size={64}
            style={{ color: 'var(--color-secondary)', margin: '0 auto' }}
          />
          <h3
            className="font-heading mt-4"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            HookLicense Minted!
          </h3>
          <p
            className="font-body mt-2"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)'
            }}
          >
            Your hook specification has been registered on-chain
          </p>
        </div>

        {/* Result Details */}
        <div
          className="angular-clip p-4 space-y-3"
          style={{
            background: 'var(--color-white)',
            border: '2px solid var(--color-secondary)'
          }}
        >
          <div className="flex justify-between items-center">
            <span
              className="font-heading"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Token ID
            </span>
            <span
              className="font-heading"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-h5)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              #{result.tokenId}
            </span>
          </div>

          <div className="flex justify-between items-center">
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
            <code
              className="font-mono"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-caption)'
              }}
            >
              {result.ipfsCid.slice(0, 12)}...{result.ipfsCid.slice(-4)}
            </code>
          </div>

          <div className="flex justify-between items-center">
            <span
              className="font-heading"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Owner
            </span>
            <code
              className="font-mono"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-caption)'
              }}
            >
              {result.ownerAddress.slice(0, 6)}...{result.ownerAddress.slice(-4)}
            </code>
          </div>
        </div>

        {/* Action Links */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <a
            href={result.ipfsGatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="angular-clip-button px-4 py-3 font-heading uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: 'var(--color-white)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-secondary)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 'var(--font-weight-bold)',
              textDecoration: 'none'
            }}
          >
            View on IPFS
            <ExternalLink size={14} />
          </a>

          {result.openSeaUrl && (
            <a
              href={result.openSeaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="angular-clip-button px-4 py-3 font-heading uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'var(--color-white)',
                color: 'var(--color-secondary)',
                border: '2px solid var(--color-secondary)',
                fontSize: 'var(--font-size-caption)',
                fontWeight: 'var(--font-weight-bold)',
                textDecoration: 'none'
              }}
            >
              View on OpenSea
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        <button
          onClick={resetFlow}
          className="angular-clip-button w-full mt-4 px-4 py-3 font-heading uppercase tracking-wider transition-all duration-200"
          style={{
            background: 'var(--color-secondary)',
            color: 'var(--color-primary)',
            border: '2px solid var(--color-secondary)',
            fontSize: 'var(--font-size-caption)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Error state
  if (currentStep === 'error') {
    return (
      <div
        className="angular-clip p-6"
        style={{
          background: 'rgba(232, 90, 79, 0.1)',
          border: '2px solid var(--color-accent)'
        }}
      >
        <div className="text-center mb-6">
          <XCircle
            size={64}
            style={{ color: 'var(--color-accent)', margin: '0 auto' }}
          />
          <h3
            className="font-heading mt-4"
            style={{
              color: 'var(--color-accent)',
              fontSize: 'var(--font-size-h4)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Submission Failed
          </h3>
          <p
            className="font-body mt-2"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)'
            }}
          >
            {error || 'An unexpected error occurred'}
          </p>
        </div>

        <button
          onClick={resetFlow}
          className="angular-clip-button w-full px-4 py-3 font-heading uppercase tracking-wider transition-all duration-200"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-secondary)',
            border: '2px solid var(--color-secondary)',
            fontSize: 'var(--font-size-body-sm)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
}
