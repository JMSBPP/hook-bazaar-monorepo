# Makefile for hook-bazaar-monorepo

# Implemented test files (non-placeholder tests)
IMPLEMENTED_TESTS := \
	test/protocol-pkg/ProtocolFactoryFacet.t.sol \
	test/protocol-pkg/ProtocolAdminRegistry.t.sol \
	test/protocol-pkg/ProtocolAdminClient.t.sol \
	test/protocol-pkg/ProtocolAdminPanel.t.sol \
	test/protocol-pkg/ProtocolAdminManager.t.sol

# Fork tests (require ALCHEMY_API_KEY env var)
FORK_TESTS := \
	test/protocol-pkg/ProtocolAdminClient.fork.t.sol \
	test/master-hook-pkg/MasterHook.fork.t.sol

# Placeholder test files (not yet implemented)
# test/master-hook-pkg/MasterHook.t.sol
# test/hook-pkg/CoFHEHook.t.sol
# test/hook-pkg/HookStateLens.t.sol
# test/hook-pkg/HaaSFacet.t.sol
# test/hook-pkg/CoFHEHookMasterHook.t.sol
# test/hooks-operator-avs/HookAttestationTaskManager.t.sol
# test/hooks-operator-avs/AttestationRegistry.t.sol
# test/hooks-operator-avs/HookAttestationServiceManager.t.sol
# test/hooks-operator-avs/HaaSVendorManagement.t.sol
# test/hooks-operator-avs/ClearingHouseEscrow.t.sol
# test/hooks-operator-avs/HookStateSampler.t.sol

.PHONY: test test-implemented test-fork test-all build clean

# Run only implemented (non-placeholder) unit tests
test-implemented:
	@echo "Running implemented unit tests..."
	forge test --match-path "contracts/test/protocol-pkg/ProtocolFactoryFacet.t.sol" -vvv
	forge test --match-path "contracts/test/protocol-pkg/ProtocolAdminRegistry.t.sol" -vvv
	forge test --match-path "contracts/test/protocol-pkg/ProtocolAdminClient.t.sol" -vvv
	forge test --match-path "contracts/test/protocol-pkg/ProtocolAdminPanel.t.sol" -vvv
	forge test --match-path "contracts/test/protocol-pkg/ProtocolAdminManager.t.sol" -vvv

# Run fork tests (requires ALCHEMY_API_KEY)
test-fork:
	@echo "Running fork tests (requires ALCHEMY_API_KEY)..."
	forge test --match-path "contracts/test/protocol-pkg/ProtocolAdminClient.fork.t.sol" -vvv
	forge test --match-path "contracts/test/master-hook-pkg/MasterHook.fork.t.sol" -vvv

# Run all implemented tests (unit + fork)
test-all-implemented: test-implemented test-fork

# Default test target runs implemented unit tests only
test: test-implemented

# Run all tests including placeholders (will show skipped/empty tests)
test-all:
	@echo "Running all tests..."
	forge test -vvv

# Build contracts
build:
	forge build

# Clean build artifacts
clean:
	forge clean
