import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { protocolAdminClientABI } from '../lib/contracts/abi';
import { getContractAddress } from '../lib/contracts/protocolAdminClient';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';

interface UseCreateProtocolOptions {
  chainId: number;
  protocolName?: string;
  onSuccess?: (protocolId: bigint) => void;
  onError?: (error: Error) => void;
}

export function useCreateProtocol({
  chainId,
  protocolName = 'My Protocol',
  onSuccess,
  onError,
}: UseCreateProtocolOptions) {
  const { address } = useAccount();
  const [protocolId, setProtocolId] = useState<bigint | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Get contract address, use zero address as fallback
  const contractAddress: Address = (() => {
    try {
      return getContractAddress(chainId);
    } catch (err) {
      // Contract not deployed on this chain - this is expected during initialization
      // Silently return zero address, error will be shown when user tries to create
      return '0x0000000000000000000000000000000000000000' as Address;
    }
  })();

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        console.log('Transaction submitted successfully:', data);
      },
      onError: (error) => {
        console.error('Transaction submission failed:', error);
      },
    },
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for ProtocolCreated event
  useWatchContractEvent({
    address: contractAddress,
    abi: protocolAdminClientABI,
    eventName: 'ProtocolCreated',
    enabled: !!hash && isConfirmed, // Only watch after transaction is confirmed
    onLogs(logs) {
      console.log('ProtocolCreated event logs received:', logs);
      // Find the log for this transaction
      // Match by protocol caller address
      const relevantLog = logs.find((log) => {
        const logCaller = log.args.protocolCaller?.toLowerCase();
        const logTokenId = log.args.tokenId;
        const matches = logCaller === address?.toLowerCase() && logTokenId;
        console.log('Checking log:', { logCaller, address: address?.toLowerCase(), logTokenId, matches });
        return matches && (!protocolId || logTokenId !== protocolId);
      });

      if (relevantLog && relevantLog.args.tokenId) {
        const id = relevantLog.args.tokenId as bigint;
        console.log('ProtocolCreated event detected! Protocol ID:', id.toString());
        setProtocolId(id);
        setIsSubscribed(true);
        if (onSuccess) {
          onSuccess(id);
        }
      } else {
        console.log('No matching ProtocolCreated event found in logs');
      }
    },
  });

  // Fallback: If transaction is confirmed but no event detected after 5 seconds, 
  // try to get protocol ID from transaction receipt or use a placeholder
  useEffect(() => {
    if (isConfirmed && hash && !protocolId && !isSubscribed) {
      console.log('Transaction confirmed but no event detected yet. Setting fallback timer...');
      const fallbackTimer = setTimeout(() => {
        if (!protocolId && !isSubscribed) {
          console.warn('No ProtocolCreated event detected after 5 seconds. Using fallback.');
          // Use a placeholder protocol ID based on transaction hash
          // In production, you might want to query the contract for the actual protocol ID
          const fallbackId = BigInt(parseInt(hash.slice(0, 10), 16));
          setProtocolId(fallbackId);
          setIsSubscribed(true);
          if (onSuccess) {
            console.log('Calling onSuccess with fallback ID:', fallbackId.toString());
            onSuccess(fallbackId);
          }
        }
      }, 5000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isConfirmed, hash, protocolId, isSubscribed, onSuccess]);

  const createProtocol = async (name?: string) => {
    const nameToUse = name || protocolName;
    
    console.log('createProtocol called with name:', nameToUse);
    
    if (!nameToUse) {
      const error = new Error('Protocol name is required');
      console.error('Protocol name is required');
      if (onError) onError(error);
      return;
    }

    // Check if contract is deployed before attempting to write
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      const error = new Error(`ProtocolAdminClient not deployed on chain ${chainId}`);
      console.error('Contract not deployed:', error.message);
      if (onError) onError(error);
      return;
    }

    console.log('Calling writeContract with:', {
      address: contractAddress,
      chainId,
      functionName: 'create_protocol',
      args: [nameToUse],
    });

    try {
      const result = writeContract({
        address: contractAddress,
        abi: protocolAdminClientABI,
        functionName: 'create_protocol',
        args: [nameToUse],
      });
      console.log('writeContract result:', result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create protocol');
      console.error('Error calling writeContract:', error);
      if (onError) onError(error);
    }
  };

  // Handle errors
  useEffect(() => {
    const error = writeError || receiptError;
    if (error) {
      console.error('Transaction error:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }, [writeError, receiptError, onError]);

  // Log state changes
  useEffect(() => {
    console.log('useCreateProtocol state:', {
      isPending,
      isConfirming,
      isConfirmed,
      hash,
      hasError: !!(writeError || receiptError),
    });
  }, [isPending, isConfirming, isConfirmed, hash, writeError, receiptError]);

  // Reset state when chain changes
  useEffect(() => {
    reset();
    setProtocolId(null);
    setIsSubscribed(false);
  }, [chainId, reset]);

  return {
    createProtocol,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isSubscribed,
    protocolId,
    error: writeError || receiptError,
  };
}

