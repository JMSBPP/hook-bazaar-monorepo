import { useState, useCallback } from 'react';
import {
  Github,
  Code,
  Terminal,
  AlertCircle,
  Check,
  GitBranch,
  FileCode,
  Settings,
  ExternalLink,
  Loader2
} from 'lucide-react';
import type {
  SubmissionResult,
  CodeVerificationResult
} from '../../types/hookSpec';

interface CodeSubmissionFlowProps {
  licenseInfo: {
    tokenId: number;
    hookName: string;
    hookVersion: string;
    specIpfsCid: string;
  };
  submissionResult: SubmissionResult;
  walletConnected: boolean;
  walletAddress?: string;
  onConnectWallet: () => void;
  onSubmitCode: (params: {
    repoUrl: string;
    branch?: string;
    contractPath?: string;
    compilerVersion: string;
    optimizerRuns: number;
    verifyOnly: boolean;
  }) => Promise<CodeVerificationResult>;
}

type SubmissionStep = 'input' | 'configure' | 'submitting' | 'complete';

const COMPILER_VERSIONS = [
  '0.8.26',
  '0.8.25',
  '0.8.24',
  '0.8.23',
  '0.8.22',
  '0.8.21',
  '0.8.20',
  '0.8.19',
];

// GitHub URL validation regex
const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export default function CodeSubmissionFlow({
  licenseInfo,
  submissionResult,
  walletConnected,
  walletAddress,
  onConnectWallet,
  onSubmitCode
}: CodeSubmissionFlowProps) {
  const [step, setStep] = useState<SubmissionStep>('input');
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [contractPath, setContractPath] = useState<string>('');
  const [compilerVersion, setCompilerVersion] = useState<string>('0.8.26');
  const [optimizerRuns, setOptimizerRuns] = useState<number>(200);
  const [verifyOnly, setVerifyOnly] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<CodeVerificationResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const validateGitHubUrl = (url: string): boolean => {
    return GITHUB_URL_REGEX.test(url.trim());
  };

  const handleUrlChange = (url: string) => {
    setRepoUrl(url);
    setUrlError(null);
  };

  const handleContinue = async () => {
    if (!repoUrl.trim()) {
      setUrlError('Please enter a GitHub repository URL');
      return;
    }

    if (!validateGitHubUrl(repoUrl)) {
      setUrlError('Invalid GitHub URL. Please use format: https://github.com/username/repo');
      return;
    }

    setIsValidating(true);
    // In production, this would validate the repo exists
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsValidating(false);
    setStep('configure');
  };

  const handleSubmit = useCallback(async () => {
    if (!repoUrl) return;

    setStep('submitting');
    setSubmissionError(null);

    try {
      const result = await onSubmitCode({
        repoUrl: repoUrl.trim(),
        branch: branch.trim() || undefined,
        contractPath: contractPath.trim() || undefined,
        compilerVersion,
        optimizerRuns,
        verifyOnly
      });

      setVerificationResult(result);
      setStep('complete');
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Submission failed');
      setStep('configure');
    }
  }, [repoUrl, branch, contractPath, compilerVersion, optimizerRuns, verifyOnly, onSubmitCode]);

  // Extract repo info from URL for display
  const getRepoInfo = (url: string) => {
    const match = url.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
    return null;
  };

  const repoInfo = repoUrl ? getRepoInfo(repoUrl) : null;

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
      <div className="mb-6">
        <h3
          className="font-heading mb-2 flex items-center gap-2"
          style={{
            color: 'var(--color-secondary)',
            fontSize: 'var(--font-size-h4)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          <Code size={24} />
          Submit Hook Code
        </h3>
        <p
          className="font-body"
          style={{
            color: 'var(--color-black)',
            fontSize: 'var(--font-size-body-sm)'
          }}
        >
          Submit your GitHub repository for AVS verification and CFHE deployment
        </p>
      </div>

      {/* License Info Banner */}
      <div
        className="angular-clip p-4 mb-6"
        style={{
          background: 'var(--color-marble-light)',
          border: '1px solid var(--color-accent)'
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span
              className="font-heading"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Hook License
            </span>
            <p
              className="font-heading"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              {licenseInfo.hookName} v{licenseInfo.hookVersion}
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
              Token ID
            </span>
            <p
              className="font-mono"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            >
              #{licenseInfo.tokenId}
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
              IPFS TX
            </span>
            <p
              className="font-mono"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-caption)'
              }}
            >
              {submissionResult.transactionHash.slice(0, 10)}...
            </p>
          </div>
        </div>
      </div>

      {/* CLI Command Alternative */}
      <div
        className="angular-clip p-4 mb-6"
        style={{
          background: 'var(--color-secondary)',
          border: '1px solid var(--color-secondary)'
        }}
      >
        <div className="flex items-start gap-3">
          <Terminal size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1 min-w-0">
            <span
              className="font-heading mb-2 block"
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Or use CLI
            </span>
            <code
              className="font-mono block p-2 angular-clip break-all"
              style={{
                background: 'rgba(0,0,0,0.3)',
                color: 'var(--color-white)',
                fontSize: 'var(--font-size-caption)'
              }}
            >
              hook-bazaar submit-code --license {licenseInfo.tokenId} --repo https://github.com/your-repo
            </code>
          </div>
        </div>
      </div>

      {/* Input Step */}
      {step === 'input' && (
        <div className="space-y-4">
          {/* GitHub URL Input */}
          <div>
            <label
              className="block font-heading mb-2"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              GitHub Repository URL
            </label>
            <div className="relative">
              <div
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-accent)' }}
              >
                <Github size={20} />
              </div>
              <input
                type="url"
                value={repoUrl}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="https://github.com/username/hook-implementation"
                className="angular-clip w-full pl-12 pr-4 py-3 font-mono"
                style={{
                  background: 'var(--color-marble-light)',
                  border: urlError ? '2px solid var(--color-accent)' : '2px solid var(--color-secondary)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              />
            </div>
            {urlError && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle size={14} style={{ color: 'var(--color-accent)' }} />
                <span
                  className="font-body"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                >
                  {urlError}
                </span>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div
            className="angular-clip p-4"
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid var(--color-primary)'
            }}
          >
            <p
              className="font-body"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            >
              Your repository should contain a Uniswap V4 hook implementation.
              The system will automatically detect hook contracts that extend <code className="font-mono">BaseHook</code>.
            </p>
            <ul
              className="mt-3 space-y-1 font-body"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)'
              }}
            >
              <li>- Supports Foundry and Hardhat projects</li>
              <li>- Auto-detects main hook contract</li>
              <li>- Verifies compliance with your HookSpec</li>
            </ul>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!repoUrl.trim() || isValidating}
            className="angular-clip-button w-full px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: repoUrl.trim() && !isValidating ? 'var(--color-primary)' : 'var(--color-marble-light)',
              color: repoUrl.trim() && !isValidating ? 'var(--color-secondary)' : 'var(--color-accent)',
              border: '2px solid var(--color-secondary)',
              fontSize: 'var(--font-size-body-sm)',
              fontWeight: 'var(--font-weight-bold)',
              cursor: repoUrl.trim() && !isValidating ? 'pointer' : 'not-allowed'
            }}
          >
            {isValidating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Validating...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      )}

      {/* Configure Step */}
      {step === 'configure' && (
        <div className="space-y-6">
          {/* Repo Info */}
          <div
            className="angular-clip p-4 flex items-center gap-3"
            style={{
              background: 'var(--color-marble-light)',
              border: '1px solid var(--color-primary)'
            }}
          >
            <Github size={24} style={{ color: 'var(--color-primary)' }} />
            <div className="flex-1">
              <span
                className="font-heading"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                {repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : repoUrl}
              </span>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mt-1 transition-colors"
                style={{ color: 'var(--color-primary)' }}
              >
                <span className="font-body" style={{ fontSize: 'var(--font-size-caption)' }}>
                  View on GitHub
                </span>
                <ExternalLink size={12} />
              </a>
            </div>
            <button
              onClick={() => {
                setStep('input');
                setRepoUrl('');
              }}
              className="font-heading transition-colors"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)'
              }}
            >
              Change
            </button>
          </div>

          {/* Optional Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GitBranch size={18} style={{ color: 'var(--color-secondary)' }} />
              <span
                className="font-heading"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                Repository Options
              </span>
              <span
                className="font-body"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)'
                }}
              >
                (Optional)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block font-heading mb-2"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="main (default)"
                  className="angular-clip w-full px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-marble-light)',
                    border: '2px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)'
                  }}
                />
              </div>

              <div>
                <label
                  className="block font-heading mb-2"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Contract Path
                </label>
                <input
                  type="text"
                  value={contractPath}
                  onChange={e => setContractPath(e.target.value)}
                  placeholder="Auto-detect"
                  className="angular-clip w-full px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-marble-light)',
                    border: '2px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)'
                  }}
                />
                <span
                  className="font-body block mt-1"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: '10px'
                  }}
                >
                  e.g., src/DynamicFeeHook.sol
                </span>
              </div>
            </div>
          </div>

          {/* Compiler Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings size={18} style={{ color: 'var(--color-secondary)' }} />
              <span
                className="font-heading"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                Compiler Settings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block font-heading mb-2"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Solidity Version
                </label>
                <select
                  value={compilerVersion}
                  onChange={e => setCompilerVersion(e.target.value)}
                  className="angular-clip w-full px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-marble-light)',
                    border: '2px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)'
                  }}
                >
                  {COMPILER_VERSIONS.map(v => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block font-heading mb-2"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Optimizer Runs
                </label>
                <input
                  type="number"
                  value={optimizerRuns}
                  onChange={e => setOptimizerRuns(parseInt(e.target.value) || 200)}
                  min={0}
                  max={10000}
                  className="angular-clip w-full px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-marble-light)',
                    border: '2px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Verify Only Option */}
          <div
            className="angular-clip p-4"
            style={{
              background: 'var(--color-marble-light)',
              border: '1px solid var(--color-accent)'
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={verifyOnly}
                onChange={e => setVerifyOnly(e.target.checked)}
                className="mt-1"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <span
                  className="font-heading"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  Verify Only (Skip CFHE Deployment)
                </span>
                <p
                  className="font-body mt-1"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                >
                  Only run AVS verification without deploying encrypted bytecode. Useful for testing compliance before final deployment.
                </p>
              </div>
            </label>
          </div>

          {/* Submission Error */}
          {submissionError && (
            <div
              className="angular-clip p-3 flex items-center gap-2"
              style={{
                background: 'rgba(232, 90, 79, 0.1)',
                border: '1px solid var(--color-accent)'
              }}
            >
              <AlertCircle size={18} style={{ color: 'var(--color-accent)' }} />
              <span
                className="font-body"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                {submissionError}
              </span>
            </div>
          )}

          {/* Wallet Connection / Submit Button */}
          {!walletConnected ? (
            <button
              onClick={onConnectWallet}
              className="angular-clip-button w-full px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200"
              style={{
                background: 'var(--color-secondary)',
                color: 'var(--color-primary)',
                border: '2px solid var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              Connect Wallet to Submit
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!repoUrl}
              className="angular-clip-button w-full px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-secondary)',
                border: '2px solid var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)',
                fontWeight: 'var(--font-weight-bold)',
                opacity: repoUrl ? 1 : 0.5,
                cursor: repoUrl ? 'pointer' : 'not-allowed'
              }}
            >
              {verifyOnly ? 'Verify Code' : 'Verify & Deploy'}
            </button>
          )}
        </div>
      )}

      {/* Submitting Step */}
      {step === 'submitting' && (
        <div className="text-center py-8">
          <div
            className="w-16 h-16 mx-auto mb-4 angular-clip flex items-center justify-center animate-pulse"
            style={{
              background: 'var(--color-primary)',
              border: '2px solid var(--color-secondary)'
            }}
          >
            <Github size={32} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <h4
            className="font-heading mb-2"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h5)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Processing...
          </h4>
          <p
            className="font-body"
            style={{
              color: 'var(--color-accent)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            Analyzing repository, verifying with AVS operators, and deploying to CFHE...
          </p>

          {/* Progress indicators */}
          <div className="mt-6 space-y-3">
            {['Cloning Repository', 'Analyzing Contracts', 'Compiling Solidity', 'Submitting to AVS', verifyOnly ? null : 'Deploying to CFHE'].filter(Boolean).map((stepName, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-2"
              >
                <div
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{
                    background: 'var(--color-primary)'
                  }}
                />
                <span
                  className="font-body"
                  style={{
                    color: 'var(--color-black)',
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

      {/* Complete Step - Pass to parent to show results components */}
      {step === 'complete' && verificationResult && (
        <div className="text-center py-4">
          <div
            className="w-16 h-16 mx-auto mb-4 angular-clip flex items-center justify-center"
            style={{
              background: verificationResult.avsResult.compliant ? 'var(--color-primary)' : 'var(--color-accent)',
              border: '2px solid var(--color-secondary)'
            }}
          >
            <Check size={32} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <h4
            className="font-heading mb-2"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h5)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {verificationResult.avsResult.compliant ? 'Verification Complete!' : 'Verification Complete (Issues Found)'}
          </h4>
          <p
            className="font-body"
            style={{
              color: 'var(--color-accent)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            View the detailed results below
          </p>

          {/* Repo Info Summary */}
          {verificationResult.repoAnalysis && (
            <div
              className="angular-clip p-3 mt-4 text-left"
              style={{
                background: 'var(--color-marble-light)',
                border: '1px solid var(--color-accent)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Github size={16} style={{ color: 'var(--color-secondary)' }} />
                <span
                  className="font-heading"
                  style={{
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  Repository Analyzed
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-heading block" style={{ color: 'var(--color-accent)', fontSize: '10px' }}>
                    Commit
                  </span>
                  <code className="font-mono" style={{ color: 'var(--color-secondary)', fontSize: '11px' }}>
                    {verificationResult.repoAnalysis.commitHash.slice(0, 8)}
                  </code>
                </div>
                <div>
                  <span className="font-heading block" style={{ color: 'var(--color-accent)', fontSize: '10px' }}>
                    Contracts Found
                  </span>
                  <span className="font-mono" style={{ color: 'var(--color-secondary)', fontSize: '11px' }}>
                    {verificationResult.repoAnalysis.contractsFound}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
