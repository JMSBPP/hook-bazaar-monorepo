
- Ok, Is great to have a market for hooks, but wait, At some point the hook is connected to a pool who bought it's license, so hook bytecode is deployed on chain, best case if you do not verify it, deecompiling the bytecode can be triky but is just a matter time beefore those tools become cheaper to use and dcompiling is way more encorouaged than paying for the subscription fee?

---> Solution --> Let's encode Hook fucntions calldata types with fhenix FHE (Fully homomorphic encription). THe bytecode deployed on chain has encrypted calldata, Thus decompiling cost goes to the moon

- (Protocol) Ok, here is the description  and formal spec document of what it does, seems like a good fit for my pool. How can I be sure it fully complies with it's spec. I do not have access to the source code. ---> AVS off-chain operator provides attestation (prover) services that gives compliance score on how well the source code complies with it's spec. This is not a single number but a whole set of detailed metrics subject on how developer reputation, audits done on the hook, etc. Since all protocols can have different semantics and desgin patterns. The AVS handles I/O services where fuzzing integration tests are done against the developer's code to verify comopantibility and indicate adapters needed to be developed 

