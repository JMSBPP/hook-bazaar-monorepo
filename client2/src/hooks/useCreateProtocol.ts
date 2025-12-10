import { useState, useEffect, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, usePublicClient } from 'wagmi';
import { protocolAdminClientABI } from '../lib/contracts/abi';
import { getContractAddress } from '../lib/contracts/protocolAdminClient';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { decodeEventLog } from 'viem';

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
  const publicClient = usePublicClient({ chainId });
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
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for ProtocolCreated event
  useWatchContractEvent({
    address: contractAddress,
    abi: protocolAdminClientABI,
    eventName: 'ProtocolCreated',
    enabled: !!hash, // Start watching as soon as transaction is submitted
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

  // Parse ProtocolCreated event from transaction receipt
  useEffect(() => {
    if (isConfirmed && receipt && !protocolId && !isSubscribed) {
      console.log('Transaction confirmed. Parsing receipt logs for ProtocolCreated event...');
      console.log('Receipt:', receipt);

      try {
        // Find the ProtocolCreated event in the logs
        const protocolCreatedLog = receipt.logs.find((log) => {
          try {
            const decoded = decodeEventLog({
              abi: protocolAdminClientABI,
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName === 'ProtocolCreated';
          } catch {
            return false;
          }
        });

        if (protocolCreatedLog) {
          const decoded = decodeEventLog({
            abi: protocolAdminClientABI,
            data: protocolCreatedLog.data,
            topics: protocolCreatedLog.topics,
          });

          console.log('Decoded ProtocolCreated event:', decoded);

          if (decoded.eventName === 'ProtocolCreated' && decoded.args) {
            const args = decoded.args as { tokenId?: bigint; protocolCaller?: Address };
            const tokenId = args.tokenId;

            if (tokenId) {
              console.log('ProtocolCreated event found! TokenId:', tokenId.toString());
              setProtocolId(tokenId);
              setIsSubscribed(true);
              if (onSuccess) {
                onSuccess(tokenId);
              }
            }
          }
        } else {
          console.warn('No ProtocolCreated event found in transaction receipt');
          console.log('All logs:', receipt.logs);
        }
      } catch (error) {
        console.error('Error parsing transaction receipt:', error);
      }
    }
  }, [isConfirmed, receipt, protocolId, isSubscribed, onSuccess]);

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

  // Expose a reset function for manual reset - memoized to prevent infinite loops
  const resetProtocolCreation = useCallback(() => {
    console.log('Resetting protocol creation state');
    reset();
    setProtocolId(null);
    setIsSubscribed(false);
  }, [reset]);

  return {
    createProtocol,
    resetProtocolCreation,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isSubscribed,
    protocolId,
    error: writeError || receiptError,
  };
}

