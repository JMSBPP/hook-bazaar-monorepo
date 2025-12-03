import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import ChainSelector from './ChainSelector';
import { useChainDeployments } from '../../hooks/useChainDeployments';
import { useWallet } from '../../hooks/useWallet';
import { useCreateProtocol } from '../../hooks/useCreateProtocol';
import { Loader2, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import confetti from 'canvas-confetti';

interface CreateProtocolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (protocolId: bigint, chainId: number, protocolName: string, feeRecipient: string) => void;
}

export default function CreateProtocolDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProtocolDialogProps) {
  // Ref to prevent multiple createProtocol calls
  const hasCalledCreateProtocol = React.useRef(false);
  // Ref to prevent multiple chain switch attempts
  const isSwitchingChain = React.useRef(false);
  
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>();
  const [protocolName, setProtocolName] = useState('');
  const [step, setStep] = useState<'select-chain' | 'enter-name' | 'connect-wallet' | 'creating' | 'success'>(
    'select-chain'
  );

  const { deployments, isLoading: deploymentsLoading } = useChainDeployments();
  const { isConnected, chainId, connectWallet, switchToChain, address } = useWallet();

  // Trigger confetti function
  const triggerConfetti = React.useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch confetti from multiple positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  // Only initialize useCreateProtocol when a chain is actually selected
  // Use the first available deployment as fallback to avoid errors
  const fallbackChainId = deployments.length > 0 ? deployments[0].chainId : 1301;
  
  const {
    createProtocol,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isSubscribed,
    protocolId,
    error,
  } = useCreateProtocol({
    chainId: selectedChainId || fallbackChainId,
    protocolName,
    onSuccess: (id) => {
      if (selectedChainId) {
        setStep('success');
        if (onSuccess) {
          // Pass protocol name and fee recipient (caller address) to success callback
          const feeRecipient = isConnected && address ? address : undefined;
          onSuccess(id, selectedChainId, protocolName, feeRecipient || '');
        }
        // Auto-close dialog after 3 seconds (give time to see confetti)
        setTimeout(() => {
          onOpenChange(false);
        }, 3000);
      }
    },
    onError: (err) => {
      console.error('Protocol creation error:', err);
      // Auto-close dialog after showing error for 3 seconds
      setTimeout(() => {
        onOpenChange(false);
      }, 3000);
    },
  });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep('select-chain');
      setSelectedChainId(undefined);
      setProtocolName('');
      hasCalledCreateProtocol.current = false;
      isSwitchingChain.current = false;
    }
  }, [open]);

  // Handle chain selection
  const handleSelectChain = (chainId: number) => {
    console.log('Chain selected:', chainId);
    setSelectedChainId(chainId);
    // If wallet not connected, go to connect-wallet step, otherwise enter-name
    if (!isConnected) {
      setStep('connect-wallet');
    } else {
      setStep('enter-name');
    }
  };

  // Handle name submission
  const handleNameSubmit = () => {
    if (protocolName.trim()) {
      console.log('Protocol name submitted:', protocolName);
      // Check if wallet is connected
      if (!isConnected) {
        alert('Please connect your wallet first');
        return;
      }
      // Check if on correct chain
      if (chainId !== selectedChainId) {
        console.log('Wrong chain, need to switch');
        // Try to switch
        isSwitchingChain.current = true;
        switchToChain(selectedChainId!);
        // Set a flag to proceed after switch
        setTimeout(() => {
          if (chainId === selectedChainId) {
            setStep('creating');
          }
        }, 1000);
      } else {
        // Already on correct chain, proceed
        setStep('creating');
      }
    }
  };

  // Monitor wallet connection and auto-proceed to enter-name when wallet connects
  useEffect(() => {
    if (step === 'connect-wallet' && isConnected) {
      console.log('Wallet connected, proceeding to enter-name step');
      setStep('enter-name');
    }
  }, [step, isConnected]);

  // Trigger confetti when success step is reached OR when transaction is confirmed
  useEffect(() => {
    if (step === 'success' && protocolId) {
      console.log('Success step reached with protocol ID:', protocolId.toString());
      triggerConfetti();
    } else if (isConfirmed && hash && !protocolId && step === 'creating') {
      // Also trigger confetti when transaction confirms, even if event not detected yet
      console.log('Transaction confirmed, triggering confetti as fallback');
      triggerConfetti();
    }
  }, [step, protocolId, isConfirmed, hash, triggerConfetti]);

  // Auto-close dialog on transaction error
  useEffect(() => {
    if (error && (step === 'creating' || isPending || isConfirming)) {
      console.log('Transaction error detected, closing dialog in 3 seconds');
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, step, isPending, isConfirming, onOpenChange]);

  // Monitor chain changes and auto-proceed to creating when correct chain is active
  useEffect(() => {
    if (step === 'enter-name' && isConnected && selectedChainId && chainId === selectedChainId && protocolName.trim()) {
      // If we're on the enter-name step and chain just switched to correct one, auto-proceed
      if (isSwitchingChain.current) {
        console.log('Chain switched successfully, auto-proceeding to create');
        isSwitchingChain.current = false;
        setStep('creating');
      }
    }
  }, [chainId, step, isConnected, selectedChainId, protocolName]);

  // Auto-proceed to creation when step is 'creating'
  useEffect(() => {
    if (step === 'creating' && isConnected && selectedChainId && chainId === selectedChainId) {
      if (!hasCalledCreateProtocol.current && !isPending && !hash) {
        console.log('Creating protocol:', protocolName, 'on chain:', chainId);
        hasCalledCreateProtocol.current = true;
        // Small delay to ensure contract is ready
        const timer = setTimeout(() => {
          console.log('Calling createProtocol directly...');
          createProtocol(protocolName);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        console.log('Skipping createProtocol - already called or pending');
      }
    } else if (step === 'creating' && chainId !== selectedChainId) {
      console.error('WRONG CHAIN! Cannot create protocol. Current:', chainId, 'Required:', selectedChainId);
      // Go back to connect-wallet step to force chain switch
      setStep('connect-wallet');
    }
    
    // Reset the ref when dialog closes or step changes away from creating
    if (step !== 'creating') {
      hasCalledCreateProtocol.current = false;
    }
  }, [step, isConnected, selectedChainId, chainId, isPending, hash, protocolName, createProtocol]);

  // Fallback: If transaction is confirmed but success step not reached, trigger success
  useEffect(() => {
    if (step === 'creating' && isConfirmed && hash && !error) {
      console.log('Transaction confirmed! Moving to success step (fallback if event not detected)');
      // Wait a bit for event, then trigger success if not already triggered
      const successTimer = setTimeout(() => {
        if (step === 'creating' && isConfirmed) {
          console.log('Triggering success step from transaction confirmation (event may not have fired)');
          setStep('success');
          // Use transaction hash as fallback protocol ID if event didn't fire
          if (!protocolId && onSuccess) {
            const fallbackId = BigInt(parseInt(hash.slice(0, 10), 16));
            const feeRecipient = isConnected && address ? address : '';
            onSuccess(fallbackId, selectedChainId || chainId, protocolName, feeRecipient);
          }
        }
      }, 2000); // Wait 2 seconds for event, then fallback
      
      return () => clearTimeout(successTimer);
    }
  }, [step, isConfirmed, hash, error, protocolId, onSuccess, selectedChainId, chainId, protocolName, isConnected, address]);

  const handleClose = () => {
    if (step !== 'creating' && !isPending && !isConfirming) {
      onOpenChange(false);
    }
  };

  const handleRetry = () => {
    setStep('select-chain');
    setSelectedChainId(undefined);
    setProtocolName('');
    hasCalledCreateProtocol.current = false;
  };

  // Stable callback for createProtocol
  const handleCreateProtocol = React.useCallback(() => {
    if (!hasCalledCreateProtocol.current && !isPending && !hash) {
      console.log('handleCreateProtocol called');
      hasCalledCreateProtocol.current = true;
      createProtocol(protocolName);
    }
  }, [createProtocol, protocolName, isPending, hash]);

  // Force render test
  if (!open) {
    return null;
  }

  return (
    <>
      {/* Visible test overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999, // Lower z-index to allow RainbowKit modal (which uses 99999) to appear above
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={(e) => {
          // Close if clicking the overlay
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div style={{
          background: '#ffffff',
          padding: '40px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          border: '3px solid #000',
        }}>
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
          
          <h2 style={{ 
            marginBottom: '20px', 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#000',
          }}>
            Create Protocol - Step: {step}
          </h2>
          
          {step === 'select-chain' && (
            <div>
              <p style={{ marginBottom: '16px' }}>Select a chain:</p>
              <ChainSelector
                deployments={deployments}
                selectedChainId={selectedChainId}
                onSelectChain={handleSelectChain}
                isLoading={deploymentsLoading}
              />
            </div>
          )}
          
          {step === 'connect-wallet' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '24px', color: '#000', fontSize: '16px', fontWeight: '500' }}>
                Connect your wallet to create a protocol on{' '}
                <strong style={{ color: '#FFD700' }}>
                  {deployments.find((d) => d.chainId === selectedChainId)?.chainName || 'selected chain'}
                </strong>
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '24px',
                minHeight: '60px',
                position: 'relative',
                zIndex: 1, // Ensure ConnectButton is clickable
              }}>
                <div style={{ transform: 'scale(1.1)' }}>
                  <ConnectButton />
                </div>
              </div>
              <p style={{ 
                marginBottom: '16px', 
                color: '#666', 
                fontSize: '12px',
                fontStyle: 'italic',
              }}>
                Click the button above to open MetaMask or another wallet
              </p>
              <button
                onClick={() => setStep('select-chain')}
                style={{ 
                  padding: '8px 16px',
                  border: '2px solid #000',
                  background: '#fff',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  marginTop: '8px',
                }}
              >
                Back to Chain Selection
              </button>
            </div>
          )}

          {step === 'enter-name' && isConnected && (
            <div>
              <label 
                htmlFor="protocol-name"
                style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  color: '#000',
                  fontWeight: '500',
                }}
              >
                Protocol Name
              </label>
              <input
                id="protocol-name"
                type="text"
                placeholder="Enter protocol name"
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && protocolName.trim()) {
                    handleNameSubmit();
                  }
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#000',
                  background: '#fff',
                }}
              />
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (!isConnected) {
                      setStep('connect-wallet');
                    } else {
                      setStep('select-chain');
                    }
                  }}
                  style={{ 
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #000',
                    background: '#fff',
                    color: '#000',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleNameSubmit}
                  disabled={!protocolName.trim()}
                  style={{ 
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #000',
                    background: protocolName.trim() ? '#FFD700' : '#ccc',
                    color: '#000',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: protocolName.trim() ? 'pointer' : 'not-allowed',
                    borderRadius: '4px',
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          
          {step === 'creating' && (
            <div style={{ textAlign: 'center' }}>
              {chainId !== selectedChainId ? (
                <div>
                  <p style={{ color: '#c00', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    ⚠️ Wrong Network
                  </p>
                  <p style={{ color: '#000', fontSize: '14px', marginBottom: '16px' }}>
                    Please switch to {deployments.find((d) => d.chainId === selectedChainId)?.chainName} (Chain {selectedChainId})
                  </p>
                  <button
                    onClick={() => {
                      switchToChain(selectedChainId!);
                      setStep('connect-wallet');
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#ffc107',
                      border: '2px solid #000',
                      color: '#000',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    Switch Network
                  </button>
                </div>
              ) : (
                <div>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: '#000' }} />
                  <p style={{ color: '#000', fontSize: '16px', fontWeight: '600' }}>Creating your protocol...</p>
                  <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    Network: {deployments.find((d) => d.chainId === selectedChainId)?.chainName}
                  </p>
                  {hash && <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>TX: {hash.slice(0, 10)}...</p>}
                </div>
              )}
            </div>
          )}
          
          {step === 'success' && (
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <CheckCircle2 
                size={64} 
                style={{ 
                  color: '#28a745', 
                  margin: '0 auto 16px',
                  animation: 'scaleIn 0.5s ease-out',
                }} 
              />
              <p style={{ 
                fontWeight: 'bold', 
                marginBottom: '8px', 
                color: '#000', 
                fontSize: '24px',
                animation: 'fadeInUp 0.5s ease-out',
              }}>
                🎉 Protocol Created Successfully! 🎉
              </p>
              {(protocolId || hash) && (
                <p style={{ 
                  color: '#000', 
                  fontSize: '16px',
                  marginBottom: '16px',
                  fontWeight: '500',
                  animation: 'fadeInUp 0.5s ease-out 0.2s both',
                }}>
                  {protocolId ? (
                    <>Protocol ID: <strong>{protocolId.toString()}</strong></>
                  ) : (
                    <>Transaction Hash: <strong>{hash?.slice(0, 10)}...{hash?.slice(-8)}</strong></>
                  )}
                </p>
              )}
              {hash && (
                <p style={{ 
                  color: '#666', 
                  fontSize: '12px',
                  marginBottom: '16px',
                  fontFamily: 'monospace',
                }}>
                  Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                </p>
              )}
              <p style={{ 
                color: '#666', 
                fontSize: '12px',
                fontStyle: 'italic',
                marginTop: '16px',
              }}>
                Dialog will close automatically in 3 seconds...
              </p>
              <style>{`
                @keyframes scaleIn {
                  from {
                    transform: scale(0);
                    opacity: 0;
                  }
                  to {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
                @keyframes fadeInUp {
                  from {
                    transform: translateY(20px);
                    opacity: 0;
                  }
                  to {
                    transform: translateY(0);
                    opacity: 1;
                  }
                }
              `}</style>
            </div>
          )}
          
          {error && (
            <div style={{ 
              marginTop: '16px', 
              padding: '16px', 
              background: '#fee', 
              border: '2px solid #c00', 
              borderRadius: '4px',
            }}>
              <p style={{ color: '#c00', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                ⚠️ Transaction Failed
              </p>
              <p style={{ color: '#c00', fontSize: '12px', marginBottom: '8px' }}>
                {error instanceof Error ? error.message : String(error)}
              </p>
              <p style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>
                Dialog will close automatically in 3 seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
  
  /* Original Dialog - temporarily disabled
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
          <DialogHeader>
          <DialogTitle
            className="font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h4)',
            }}
          >
            Create Protocol
          </DialogTitle>
          <DialogDescription
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body)',
            }}
          >
            {step === 'select-chain' && 'Choose a chain to deploy your protocol'}
            {step === 'enter-name' && 'Enter a name for your protocol'}
            {step === 'connect-wallet' && 'Connect your wallet to continue'}
            {step === 'creating' && 'Creating your protocol...'}
            {step === 'success' && 'Protocol created successfully!'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 'select-chain' && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#000', marginBottom: '16px', fontSize: '14px' }}>
                Choose a blockchain network to deploy your protocol:
              </p>
              <ChainSelector
                deployments={deployments}
                selectedChainId={selectedChainId}
                onSelectChain={handleSelectChain}
                isLoading={deploymentsLoading}
              />
            </div>
          )}

          {step === 'enter-name' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="protocol-name">Protocol Name</Label>
                <Input
                  id="protocol-name"
                  placeholder="Enter protocol name"
                  value={protocolName}
                  onChange={(e) => setProtocolName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && protocolName.trim()) {
                      handleNameSubmit();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep('select-chain')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNameSubmit}
                  disabled={!protocolName.trim()}
                  className="flex-1"
                  style={{
                    background: protocolName.trim() ? 'var(--color-primary)' : undefined,
                    color: protocolName.trim() ? 'var(--color-secondary)' : undefined,
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'connect-wallet' && (
            <div className="space-y-4">
              <p
                className="text-sm"
                style={{ color: 'var(--color-black)' }}
              >
                Please connect your wallet to create a protocol on{' '}
                {deployments.find((d) => d.chainId === selectedChainId)?.chainName}
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          )}

          {step === 'creating' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-4">
                {(isPending || isConfirming) && (
                  <>
                    <Loader2
                      size={32}
                      className="animate-spin"
                      style={{ color: 'var(--color-primary)' }}
                    />
                    <div className="text-center">
                      <p
                        className="font-heading font-medium mb-1"
                        style={{ color: 'var(--color-secondary)' }}
                      >
                        {isPending ? 'Waiting for transaction...' : 'Confirming transaction...'}
                      </p>
                      {hash && (
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {error && (
                  <div className="w-full">
                    <div
                      className="angular-clip p-4 flex items-start gap-3"
                      style={{
                        background: 'var(--color-marble-light)',
                        border: '2px solid var(--color-accent)',
                      }}
                    >
                      <AlertCircle
                        size={20}
                        style={{ color: 'var(--color-accent)', flexShrink: 0 }}
                      />
                      <div className="flex-1">
                        <p
                          className="font-heading font-medium mb-1"
                          style={{ color: 'var(--color-secondary)' }}
                        >
                          Error creating protocol
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--color-black)' }}
                        >
                          {error instanceof Error ? error.message : String(error)}
                        </p>
                        <Button
                          onClick={handleRetry}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle2
                  size={48}
                  style={{ color: 'var(--color-primary)' }}
                />
                <div className="text-center">
                  <p
                    className="font-heading font-bold mb-2"
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-h5)',
                    }}
                  >
                    Protocol Created Successfully!
                  </p>
                  {protocolId && (
                    <p
                      className="text-sm mb-1"
                      style={{ color: 'var(--color-black)' }}
                    >
                      Protocol ID: {protocolId.toString()}
                    </p>
                  )}
                  {hash && (
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  */
}


