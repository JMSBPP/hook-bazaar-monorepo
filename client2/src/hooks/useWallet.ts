import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const connectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const switchToChain = (targetChainId: number) => {
    if (chainId !== targetChainId) {
      switchChain({ chainId: targetChainId });
    }
  };

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    connectWallet,
    switchToChain,
  };
}


