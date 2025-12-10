import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Github, Shield, Lock, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../Navigation';
import Footer from '../Footer';
import CodeSubmissionFlow from './CodeSubmissionFlow';
import AVSVerificationResults from './AVSVerificationResults';
import CFHEDeploymentStatus from './CFHEDeploymentStatus';
import type {
  SubmissionResult,
  CodeVerificationResult
} from '../../types/hookSpec';

interface CodeVerificationPageProps {
  onNavigate?: (page: string) => void;
}

type VerificationStep = 'submit-code' | 'verifying' | 'results';

const STEPS: { id: VerificationStep; title: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'submit-code',
    title: 'Submit Code',
    description: 'Link GitHub repository',
    icon: <Github size={18} />
  },
  {
    id: 'verifying',
    title: 'AVS Verification',
    description: 'Compliance check',
    icon: <Shield size={18} />
  },
  {
    id: 'results',
    title: 'Deploy',
    description: 'CFHE deployment',
    icon: <Lock size={18} />
  }
];

export default function CodeVerificationPage({ onNavigate }: CodeVerificationPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get license info from navigation state (passed from CreateHookPage after minting)
  const locationState = location.state as {
    licenseInfo?: {
      tokenId: number;
      hookName: string;
      hookVersion: string;
      specIpfsCid: string;
    };
    submissionResult?: SubmissionResult;
  } | null;

  const [currentStep, setCurrentStep] = useState<VerificationStep>('submit-code');
  const [codeVerificationResult, setCodeVerificationResult] = useState<CodeVerificationResult | null>(null);

  // Mock license info if not passed (for direct navigation/testing)
  const [licenseInfo] = useState(locationState?.licenseInfo || {
    tokenId: 42,
    hookName: 'DynamicFeeHook',
    hookVersion: '1.0.0',
    specIpfsCid: 'QmMockSpecCid123456789'
  });

  const [submissionResult] = useState<SubmissionResult>(locationState?.submissionResult || {
    success: true,
    ipfsCid: 'QmMockSpecCid123456789',
    tokenId: 42,
    transactionHash: '0xmock1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
    ipfsGatewayUrl: 'https://ipfs.io/ipfs/QmMockSpecCid123456789',
    openSeaUrl: 'https://opensea.io/assets/ethereum/...'
  });

  // Mock wallet state
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletAddress] = useState('0x1234567890abcdef1234567890abcdef12345678');

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigate(`/${page}`);
    }
  };

  const handleConnectWallet = useCallback(() => {
    setWalletConnected(true);
  }, []);

  const handleCodeSubmit = useCallback(async (params: {
    repoUrl: string;
    branch?: string;
    contractPath?: string;
    compilerVersion: string;
    optimizerRuns: number;
    verifyOnly: boolean;
  }): Promise<CodeVerificationResult> => {
    // Move to verifying step
    setCurrentStep('verifying');

    // Simulate code verification
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockResult: CodeVerificationResult = {
      success: true,
      repoAnalysis: {
        repoUrl: params.repoUrl,
        branch: params.branch || 'main',
        commitHash: 'a1b2c3d4e5f6g7h8i9j0' + Math.random().toString(36).slice(2, 6),
        mainContract: params.contractPath || 'src/DynamicFeeHook.sol',
        contractsFound: 3,
        dependencies: ['@uniswap/v4-core', '@openzeppelin/contracts']
      },
      compilation: {
        success: true,
        bytecodeHash: '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
        deployedBytecodeHash: '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
      },
      avsResult: {
        compliant: true,
        complianceScore: 96.5,
        attestationId: '0xattest' + Math.random().toString(16).slice(2, 18),
        attestationTxHash: '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
        findings: [
          {
            severity: 'info',
            ruleId: 'GAS-01',
            ruleName: 'Gas Optimization',
            description: 'Consider using unchecked blocks for arithmetic operations that cannot overflow',
            codeLocation: { startLine: 45, endLine: 48, functionName: 'beforeSwap' },
            specReference: 'Section 3.2 - State Transitions'
          },
          {
            severity: 'warning',
            ruleId: 'SEC-02',
            ruleName: 'Reentrancy Check',
            description: 'External call detected before state update. Ensure reentrancy protection is in place.',
            codeLocation: { startLine: 72, endLine: 75, functionName: 'afterSwap' }
          }
        ],
        verificationTimestamp: Date.now()
      },
      cfheResult: params.verifyOnly ? undefined : {
        encryptedBytecodeHash: '0xenc' + Math.random().toString(16).slice(2, 30),
        deploymentTxHash: '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
        encryptedContractAddress: '0x' + Math.random().toString(16).slice(2, 42),
        blockNumber: 18500000 + Math.floor(Math.random() * 10000),
        explorerUrl: 'https://explorer.inco.org/tx/0x...'
      },
      summary: {
        hookName: licenseInfo.hookName,
        hookVersion: licenseInfo.hookVersion,
        licenseTokenId: licenseInfo.tokenId,
        specIpfsCid: licenseInfo.specIpfsCid,
        repoUrl: params.repoUrl,
        commitHash: 'a1b2c3d4',
        submittedAt: Date.now() - 3000,
        completedAt: Date.now()
      }
    };

    setCodeVerificationResult(mockResult);
    setCurrentStep('results');
    return mockResult;
  }, [licenseInfo]);

  const goToStep = (step: VerificationStep) => {
    const stepOrder: VerificationStep[] = ['submit-code', 'verifying', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);

    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
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
            Verify & Deploy <span style={{ color: 'var(--color-primary)' }}>Code</span>
          </h1>
          <p
            className="font-body"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body)'
            }}
          >
            Link your GitHub repository for AVS verification and CFHE deployment
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-lg)' }}>
        <div className="container-custom">
          <div className="flex items-center justify-center gap-4">
            {STEPS.map((step, index) => {
              const stepOrder: VerificationStep[] = ['submit-code', 'verifying', 'results'];
              const currentIndex = stepOrder.indexOf(currentStep);
              const stepIndex = stepOrder.indexOf(step.id);
              const isActive = step.id === currentStep;
              const isCompleted = stepIndex < currentIndex;
              const isAccessible = stepIndex <= currentIndex;

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
                      className="angular-clip w-12 h-12 flex items-center justify-center"
                      style={{
                        background: isActive
                          ? 'var(--color-primary)'
                          : isCompleted
                          ? 'var(--color-secondary)'
                          : 'var(--color-marble-light)',
                        color: isActive || isCompleted
                          ? isActive ? 'var(--color-secondary)' : 'var(--color-primary)'
                          : 'var(--color-accent)',
                        border: `2px solid ${isActive ? 'var(--color-secondary)' : 'var(--color-accent)'}`
                      }}
                    >
                      {isCompleted ? <CheckCircle size={20} /> : step.icon}
                    </div>
                    <div className="text-left">
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
                      className="mx-6"
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
        <div className="container-custom max-w-4xl mx-auto">
          {/* Code Submission Step */}
          {currentStep === 'submit-code' && (
            <CodeSubmissionFlow
              licenseInfo={licenseInfo}
              submissionResult={submissionResult}
              walletConnected={walletConnected}
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
              onSubmitCode={handleCodeSubmit}
            />
          )}

          {/* Verifying Step */}
          {currentStep === 'verifying' && (
            <div
              className="angular-clip p-8 text-center"
              style={{
                background: 'var(--color-white)',
                border: '2px solid var(--color-secondary)'
              }}
            >
              <div
                className="w-20 h-20 mx-auto mb-6 angular-clip flex items-center justify-center animate-pulse"
                style={{
                  background: 'var(--color-primary)',
                  border: '2px solid var(--color-secondary)'
                }}
              >
                <Shield size={40} style={{ color: 'var(--color-secondary)' }} />
              </div>
              <h3
                className="font-heading mb-2"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-h4)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                Verification in Progress
              </h3>
              <p
                className="font-body mb-8"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                AVS operators are verifying your code against the HookSpec specification...
              </p>

              {/* Progress Steps */}
              <div className="space-y-4 max-w-md mx-auto">
                {[
                  'Cloning Repository',
                  'Analyzing Contracts',
                  'Compiling Solidity',
                  'AVS Consensus',
                  'CFHE Encryption',
                  'Deploying'
                ].map((stepName, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 angular-clip"
                    style={{
                      background: 'var(--color-marble-light)',
                      border: '1px solid var(--color-accent)'
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full animate-pulse"
                      style={{ background: 'var(--color-primary)' }}
                    />
                    <span
                      className="font-body"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body-sm)'
                      }}
                    >
                      {stepName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Step */}
          {currentStep === 'results' && codeVerificationResult && (
            <div className="space-y-6">
              {/* AVS Verification Results */}
              <AVSVerificationResults
                compilationResult={codeVerificationResult.compilation}
                avsResult={codeVerificationResult.avsResult}
              />

              {/* CFHE Deployment Status */}
              {codeVerificationResult.cfheResult && (
                <CFHEDeploymentStatus
                  cfheResult={codeVerificationResult.cfheResult}
                />
              )}

              {/* Success Summary */}
              <div
                className="angular-clip p-6"
                style={{
                  background: 'rgba(255, 215, 0, 0.15)',
                  border: '2px solid var(--color-primary)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={28} style={{ color: 'var(--color-primary)' }} />
                  <h3
                    className="font-heading"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-h4)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    Verification Complete!
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <span
                      className="font-heading block mb-1"
                      style={{
                        color: 'var(--color-accent)',
                        fontSize: 'var(--font-size-caption)',
                        textTransform: 'uppercase'
                      }}
                    >
                      Hook Name
                    </span>
                    <span
                      className="font-heading"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body)'
                      }}
                    >
                      {codeVerificationResult.summary.hookName} v{codeVerificationResult.summary.hookVersion}
                    </span>
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
                      License Token ID
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-body)'
                      }}
                    >
                      #{codeVerificationResult.summary.licenseTokenId}
                    </span>
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
                      Compliance Score
                    </span>
                    <span
                      className="font-heading"
                      style={{
                        color: 'var(--color-primary)',
                        fontSize: 'var(--font-size-body)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      {codeVerificationResult.avsResult.complianceScore.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigate('hook-developer')}
                  className="angular-clip-button px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200"
                  style={{
                    background: 'var(--color-secondary)',
                    color: 'var(--color-primary)',
                    border: '2px solid var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
