/**
 * HookAttestationAVS State Sampler
 *
 * Samples pool and hook state for verification.
 * Based on: avs-verification-system.md Section 4.3
 *
 * The sampler collects state before and after callback execution
 * to enable behavioral verification without accessing source code.
 */

import { ethers } from "ethers";
import { SAMPLING_TIMEOUT_MS } from "./config.js";
import {
  AttestationTask,
  HookCallback,
  HookSpecification,
  SharedFeeState,
  StateSample,
  TraderState,
  TransitionSample,
  HOOK_STATE_VIEW_ABI,
} from "./types.js";

// ═══════════════════════════════════════════════════════════════════════════════
// STATE VIEW CONTRACT INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Interface for interacting with hook state view contracts
 * TODO: This will need to be updated when IHookStateView is deployed
 */
export interface IStateViewContract {
  getTraderState(poolId: string): Promise<TraderState>;
  getSharedFeeState(poolId: string): Promise<SharedFeeState>;
  getHookState(poolId: string): Promise<Record<string, unknown>>;
}

/**
 * Create a state view contract instance
 * TODO: Replace with actual contract when deployed
 */
export function createStateViewContract(
  address: string,
  provider: ethers.Provider
): IStateViewContract {
  const contract = new ethers.Contract(address, HOOK_STATE_VIEW_ABI, provider);

  return {
    async getTraderState(poolId: string): Promise<TraderState> {
      try {
        const result = await contract.getTraderState(poolId);
        return {
          sqrtPrice: BigInt(result.sqrtPrice.toString()),
          tick: Number(result.tick),
          lpFee: Number(result.lpFee),
          protocolFee: Number(result.protocolFee),
        };
      } catch (error) {
        console.error(`[StateSampler] Failed to get trader state: ${error}`);
        throw error;
      }
    },

    async getSharedFeeState(poolId: string): Promise<SharedFeeState> {
      try {
        const [feeGrowth0, feeGrowth1] = await contract.getSharedFeeState(poolId);
        return {
          feeGrowthGlobal0X128: BigInt(feeGrowth0.toString()),
          feeGrowthGlobal1X128: BigInt(feeGrowth1.toString()),
        };
      } catch (error) {
        console.error(`[StateSampler] Failed to get shared fee state: ${error}`);
        throw error;
      }
    },

    async getHookState(poolId: string): Promise<Record<string, unknown>> {
      try {
        const result = await contract.getHookState(poolId);
        // Decode hook state - format depends on hook implementation
        // For now, return raw bytes as hex string
        return { rawState: result };
      } catch (error) {
        console.error(`[StateSampler] Failed to get hook state: ${error}`);
        throw error;
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK STATE VIEW (for testing without deployed contracts)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a mock state view for testing
 */
export function createMockStateView(): IStateViewContract {
  let callCount = 0;

  return {
    async getTraderState(_poolId: string): Promise<TraderState> {
      callCount++;
      // Return varying state to simulate real pool behavior
      const basePrice = 79228162514264337593543950336n; // ~1.0 in sqrtPriceX96
      const variance = BigInt(callCount) * 1000000000000n;
      return {
        sqrtPrice: basePrice + variance,
        tick: -100 + callCount,
        lpFee: 3000, // 0.3%
        protocolFee: 0,
      };
    },

    async getSharedFeeState(_poolId: string): Promise<SharedFeeState> {
      return {
        feeGrowthGlobal0X128: BigInt(callCount) * 10n ** 20n,
        feeGrowthGlobal1X128: BigInt(callCount) * 10n ** 20n,
      };
    },

    async getHookState(_poolId: string): Promise<Record<string, unknown>> {
      return {
        lastPrice: 79228162514264337593543950336n,
        volatilityWindow: 100,
        feeMultiplier: 3000 + callCount * 10,
      };
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE SAMPLING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sample current state for a pool
 */
export async function sampleCurrentState(
  poolId: string,
  stateView: IStateViewContract,
  provider: ethers.Provider
): Promise<StateSample> {
  const [block, traderState, sharedState, hookState] = await Promise.all([
    provider.getBlock("latest"),
    stateView.getTraderState(poolId),
    stateView.getSharedFeeState(poolId),
    stateView.getHookState(poolId),
  ]);

  if (!block) {
    throw new Error("Failed to get latest block");
  }

  return {
    blockNumber: block.number,
    timestamp: block.timestamp,
    poolId,
    traderState,
    hookState,
    sharedState,
  };
}

/**
 * Generate a synthetic callback input for testing
 * Based on callback type and current state
 */
export function generateCallbackInput(
  callback: HookCallback,
  preState: StateSample,
  spec: HookSpecification
): { selector: string; input: string } {
  // Find the transition function for this callback
  const tf = spec.transitionFunctions.find((t) => t.callback === callback);

  // Generate input based on callback type
  switch (callback) {
    case HookCallback.BEFORE_SWAP:
    case HookCallback.AFTER_SWAP:
      // Simulate a swap
      return {
        selector: "0xec9f4aa6", // beforeSwap selector
        input: ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "tuple(bytes32,bool,int256,uint160)"],
          [
            "0x0000000000000000000000000000000000000001", // sender
            [
              preState.poolId, // poolId
              true, // zeroForOne
              1000000000000000000n, // amountSpecified (1 token)
              preState.traderState.sqrtPrice - 1000000000000000n, // sqrtPriceLimitX96
            ],
          ]
        ),
      };

    case HookCallback.BEFORE_ADD_LIQUIDITY:
    case HookCallback.AFTER_ADD_LIQUIDITY:
      return {
        selector: "0x259982e5",
        input: ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "tuple(bytes32,int24,int24,int256,bytes32)"],
          [
            "0x0000000000000000000000000000000000000001",
            [
              preState.poolId,
              -60, // tickLower
              60, // tickUpper
              1000000000000000000n, // liquidityDelta
              ethers.zeroPadValue("0x", 32), // salt
            ],
          ]
        ),
      };

    default:
      // Generic empty input for other callbacks
      return {
        selector: "0x00000000",
        input: "0x",
      };
  }
}

/**
 * Simulate a callback execution and record the transition
 * NOTE: In production, this would execute via PoolManager
 * For now, we sample pre/post state assuming callback happened between samples
 */
export async function sampleTransition(
  poolId: string,
  callback: HookCallback,
  spec: HookSpecification,
  stateView: IStateViewContract,
  provider: ethers.Provider
): Promise<TransitionSample> {
  // Sample pre-state
  const preState = await sampleCurrentState(poolId, stateView, provider);

  // Generate callback input
  const { selector, input } = generateCallbackInput(callback, preState, spec);

  // In a real implementation, we would:
  // 1. Execute the callback via PoolManager
  // 2. Capture gas usage
  // 3. Capture return data
  //
  // For now, we simulate by waiting briefly and sampling again
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Sample post-state
  const postState = await sampleCurrentState(poolId, stateView, provider);

  return {
    preState,
    callback: selector,
    input,
    postState,
    gasUsed: 50000n, // Estimated gas
    returnData: "0x",
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH SAMPLING FOR TASK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sampling progress callback
 */
export type SamplingProgressCallback = (
  completed: number,
  total: number,
  currentPool: string
) => void;

/**
 * Sample states for an attestation task
 */
export async function sampleStatesForTask(
  task: AttestationTask,
  spec: HookSpecification,
  stateView: IStateViewContract,
  provider: ethers.Provider,
  onProgress?: SamplingProgressCallback
): Promise<TransitionSample[]> {
  const samples: TransitionSample[] = [];
  const totalSamples = task.poolIds.length * task.callbacks.length * task.sampleCount;
  let completed = 0;

  console.log(
    `[StateSampler] Starting sampling: ${task.poolIds.length} pools × ${task.callbacks.length} callbacks × ${task.sampleCount} samples = ${totalSamples} total`
  );

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Sampling timeout")), SAMPLING_TIMEOUT_MS);
  });

  // Sample each pool
  for (const poolId of task.poolIds) {
    // Sample each callback
    for (const callbackSelector of task.callbacks) {
      // Map selector to callback enum
      const callback = selectorToCallback(callbackSelector);
      if (!callback) {
        console.warn(`[StateSampler] Unknown callback selector: ${callbackSelector}`);
        continue;
      }

      // Collect required number of samples
      for (let i = 0; i < task.sampleCount; i++) {
        try {
          const sample = await Promise.race([
            sampleTransition(poolId, callback, spec, stateView, provider),
            timeoutPromise,
          ]);
          samples.push(sample);
          completed++;

          if (onProgress) {
            onProgress(completed, totalSamples, poolId);
          }

          // Small delay between samples to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (error) {
          console.error(
            `[StateSampler] Failed to sample ${callback} for pool ${poolId}: ${error}`
          );
          // Continue with other samples
        }
      }
    }
  }

  console.log(`[StateSampler] Completed sampling: ${samples.length}/${totalSamples} samples`);
  return samples;
}

/**
 * Map callback selector to HookCallback enum
 */
function selectorToCallback(selector: string): HookCallback | null {
  const selectorMap: Record<string, HookCallback> = {
    "0x34bc5f74": HookCallback.BEFORE_INITIALIZE,
    "0x21d0ee70": HookCallback.AFTER_INITIALIZE,
    "0x259982e5": HookCallback.BEFORE_ADD_LIQUIDITY,
    "0xe5c17b97": HookCallback.AFTER_ADD_LIQUIDITY,
    "0x5765a5cc": HookCallback.BEFORE_REMOVE_LIQUIDITY,
    "0xd6c21c59": HookCallback.AFTER_REMOVE_LIQUIDITY,
    "0xec9f4aa6": HookCallback.BEFORE_SWAP,
    "0x9ca3a9e7": HookCallback.AFTER_SWAP,
    "0x0d046ae5": HookCallback.BEFORE_DONATE,
    "0xae63ec0e": HookCallback.AFTER_DONATE,
  };

  return selectorMap[selector.toLowerCase()] ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE HASHING (for attestation response)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute hash of all state samples
 */
export function hashStateSamples(samples: TransitionSample[]): string {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["tuple(uint256,uint256,bytes32,uint160,int24,uint24,bytes32,uint160,int24,uint24)[]"],
    [
      samples.map((s) => [
        s.preState.blockNumber,
        s.preState.timestamp,
        s.preState.poolId,
        s.preState.traderState.sqrtPrice,
        s.preState.traderState.tick,
        s.preState.traderState.lpFee,
        s.postState.poolId,
        s.postState.traderState.sqrtPrice,
        s.postState.traderState.tick,
        s.postState.traderState.lpFee,
      ]),
    ]
  );
  return ethers.keccak256(encoded);
}
