- Possible conflicts during the initialization of Factory and Registry in between the initialization of Panel
- Owner or access control on who initializes the factory and registry

- The protocol factory MUST always be initialized before the AdminRegistry. (This needs to be included in the README.)
- The tests that require initialization as a modifier for AdminRegistry need revisions.

Is there a prblem of access right s with this 

vm.startPrank(any_caller);

address _admin_manager = IProtocolAdminRegistry(protocol_admin_panel).protocol_manager(uint256(0x01));

vm.stopPrank();

vm.startPrank(protocol_admin_panel);

IComponent(protocol_admin_manager_impl).initialize(any_caller);

vm.stopPrank();


- replace all /metadata/ appareances for /createProtocol/