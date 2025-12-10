import {
  Lock,
  CheckCircle,
  ExternalLink,
  Copy,
  Shield,
  Cpu,
  Hash
} from 'lucide-react';
import type { CFHEDeploymentResult } from '../../types/hookSpec';

interface CFHEDeploymentStatusProps {
  cfheResult: CFHEDeploymentResult;
}

export default function CFHEDeploymentStatus({ cfheResult }: CFHEDeploymentStatusProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
            background: 'var(--color-primary)',
            border: '2px solid var(--color-secondary)'
          }}
        >
          <Lock size={24} style={{ color: 'var(--color-secondary)' }} />
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
            CFHE Deployment
          </h3>
          <p
            className="font-body"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            Encrypted bytecode deployed to confidential FHE network
          </p>
        </div>
      </div>

      {/* Success Banner */}
      <div
        className="angular-clip p-4 mb-6 flex items-center gap-3"
        style={{
          background: 'rgba(255, 215, 0, 0.15)',
          border: '2px solid var(--color-primary)'
        }}
      >
        <CheckCircle size={24} style={{ color: 'var(--color-primary)' }} />
        <div>
          <span
            className="font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Deployment Successful
          </span>
          <p
            className="font-body"
            style={{
              color: 'var(--color-accent)',
              fontSize: 'var(--font-size-caption)'
            }}
          >
            Your hook bytecode has been encrypted and deployed
          </p>
        </div>
      </div>

      {/* Deployment Details */}
      <div className="space-y-4">
        {/* Encrypted Contract Address */}
        <div
          className="angular-clip p-4"
          style={{
            background: 'var(--color-marble-light)',
            border: '1px solid var(--color-accent)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} style={{ color: 'var(--color-secondary)' }} />
            <span
              className="font-heading"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Encrypted Contract Address
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code
              className="font-mono flex-1 break-all"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            >
              {cfheResult.encryptedContractAddress}
            </code>
            <button
              onClick={() => copyToClipboard(cfheResult.encryptedContractAddress)}
              className="p-1 transition-colors"
              style={{ color: 'var(--color-accent)' }}
              title="Copy address"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Transaction Hash */}
        <div
          className="angular-clip p-4"
          style={{
            background: 'var(--color-marble-light)',
            border: '1px solid var(--color-accent)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Hash size={16} style={{ color: 'var(--color-secondary)' }} />
            <span
              className="font-heading"
              style={{
                color: 'var(--color-accent)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Deployment Transaction
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code
              className="font-mono flex-1 break-all"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-caption)'
              }}
            >
              {cfheResult.deploymentTxHash}
            </code>
            <a
              href={cfheResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 transition-colors"
              style={{ color: 'var(--color-primary)' }}
              title="View on Explorer"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Encrypted Bytecode Hash */}
          <div
            className="angular-clip p-4"
            style={{
              background: 'var(--color-marble-light)',
              border: '1px solid var(--color-accent)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={16} style={{ color: 'var(--color-secondary)' }} />
              <span
                className="font-heading"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Encrypted Bytecode Hash
              </span>
            </div>
            <code
              className="font-mono break-all"
              style={{
                color: 'var(--color-secondary)',
                fontSize: '11px'
              }}
            >
              {cfheResult.encryptedBytecodeHash.slice(0, 22)}...
            </code>
          </div>

          {/* Block Number */}
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
              Block Number
            </span>
            <span
              className="font-mono"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              #{cfheResult.blockNumber.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* View on Explorer Button */}
      <a
        href={cfheResult.explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="angular-clip-button w-full mt-6 px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
        style={{
          background: 'var(--color-secondary)',
          color: 'var(--color-primary)',
          border: '2px solid var(--color-secondary)',
          fontSize: 'var(--font-size-body-sm)',
          fontWeight: 'var(--font-weight-bold)',
          textDecoration: 'none'
        }}
      >
        <ExternalLink size={18} />
        View on CFHE Explorer
      </a>
    </div>
  );
}
