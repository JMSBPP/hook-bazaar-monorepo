start:
	source .env

build:
	FOUNDRY_PROFILE=protocol-pkg forge build

help:
	@echo "Available targets:"
	@echo "  make build                    - Build the project"
	@echo "  make deploy flag=--all       - Deploy all protocol contracts"
	@echo "  make initialize baseURI=...  - Initialize protocol admin client"
	@echo "  make create-protocol name=... - Create a new protocol"
	@echo ""
	@echo "Examples:"
	@echo "  make deploy flag=--all"
	@echo "  make initialize baseURI=\"http://localhost:3000/metadata/\""
	@echo "  make create-protocol name=\"MyProtocol\""

deploy:
	@bash -c 'source .env && \
	if [ "$(flag)" = "--all" ]; then \
		forge script script/Deploy.s.sol:DeployAll --broadcast --rpc-url $$RPC_URL --private-key $$PRIVATE_KEY; \
	else \
		echo "Usage: make deploy flag=--all"; \
		echo "Available flags:"; \
		echo "  --all    Deploy all protocol contracts"; \
	fi'

initialize:
	@bash -c 'source .env && \
	if [ -z "$(baseURI)" ]; then \
		echo "Error: baseURI parameter is required"; \
		echo "Usage: make initialize baseURI=\"http://localhost:3000/metadata/\""; \
		exit 1; \
	else \
		forge script script/Initialize.s.sol:Initialize --sig "run(string)" "$(baseURI)" --broadcast --rpc-url $$RPC_URL --private-key $$PRIVATE_KEY; \
	fi'

create-protocol:
	@bash -c 'source .env && \
	if [ -z "$(name)" ]; then \
		echo "Error: name parameter is required"; \
		echo "Usage: make create-protocol name=\"MyProtocol\""; \
		exit 1; \
	else \
		forge script script/CreateProtocol.s.sol:CreateProtocol --sig "run(string)" "$(name)" --broadcast --rpc-url $$RPC_URL --private-key $$PRIVATE_KEY; \
	fi'

