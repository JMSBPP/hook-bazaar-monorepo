start:
	source .env
deploy:
	@(MAKE) start
	forge script script/deployments/* --private-key $PRIVATE_KEY --broadcast

deploy-sepolia:
	source .env  && \
	forge script script/deployments/DeployProtocolContracts.sol:Deploy \
		--rpc-url sepolia \
		--private-key $$PRIVATE_KEY \
		--broadcast