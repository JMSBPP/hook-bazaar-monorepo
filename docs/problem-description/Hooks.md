## User Only

Let's consider a protocol $P_i = \cup p_{ij} \in \mathbb{P}$ in the space of all protocols
- economicaly $P_i$ delivers a final product that satisifies certain utility for its intended end user
- The collection of pools on the protocol MUST have a economic menaning that aligns with the economic meaning given to hooks
- linkages among protocols can be studied through it's demands for intermediary inputs and their competition for the factors of production

- On the SAM for protocols the "Acticity" column describe thee inputs used by (the equivalent to insdustries on DeFi protocols)
- THe activity row describes the "Use of indststries" (or the equivalent on DeFi protocols) as inpouts for other (equivalent to insdustries on DeFi protocols)

- Protocol are assumed to maximize their efficiency subject to the flexibility afforded by the technological production process (some index on infra on Blockchain)

Based on that protcols choose their __inputs and output levels__

---

## Hypothesis: Vanilla Pools as Intermediate Inputs

### Core Thesis

**Vanilla pools (without hooks) should be classified as intermediate inputs**, since they lack the differentiation that provides competitive advantage. Only when hooks are added do pools transform into **production units (firms)**.

### Economic Justification

| Pool Type | Classification | Economic Character |
|-----------|---------------|-------------------|
| **Vanilla Pool** (no hooks) | **Intermediate Input** | Homogeneous, commodity-like, perfectly substitutable |
| **Pool + Hooks** | **Production Unit (Firm)** | Differentiated, competitive advantage, value-creating |

### Why Vanilla Pools = Intermediate Inputs

From Leontief-Sraffa input-output theory, intermediate inputs are characterized by:

1. **Homogeneity**: All vanilla ETH/USDC pools are functionally identical
2. **Perfect substitutability**: Users are indifferent between vanilla pools (given same fees)
3. **No value added**: Just "pass-through" of liquidity services
4. **Price = marginal cost**: No economic profit in competitive equilibrium

$$\pi_{vanilla} = 0 \quad \text{(zero economic profit)}$$

### Why Pool + Hooks = Production Unit

Adding hooks transforms the pool because:

1. **Differentiation**: MEV protection, dynamic fees, oracle integration create unique value
2. **Competitive advantage**: Quality competition, not just price competition
3. **Value added**: Hook services create surplus above commodity value
4. **Economic profit possible**: Differentiation enables $\pi > 0$

$$\pi_{enhanced} = V_{hooks} - C_{hooks} > 0 \quad \text{(positive returns to differentiation)}$$

### The Hook Transformation

$$\text{Intermediate Input} \xrightarrow{\text{+ Hooks}} \text{Production Unit}$$

| Dimension | Vanilla Pool | Pool + Hooks |
|-----------|--------------|--------------|
| **Competition** | Price only | Price + Quality |
| **Substitutability** | Perfect | Imperfect |
| **Economic profit** | Zero | Positive possible |
| **SAM classification** | Intermediate flow | Activity column |
| **I-O treatment** | In $\mathbf{A}$ matrix | Separate sector |

---

## Input-Output Coefficients ($a_{ij}$)

### Definition

The **technical coefficient** measures input requirements:

$$a_{ij} = \frac{z_{ij}}{X_j} = \frac{\text{Value of input } i \text{ consumed by } j}{\text{Total output of } j}$$

### Hook Bazaar Equivalences

| Coefficient | Economic Meaning | Example |
|-------------|------------------|---------|
| $a_{H \to P}$ | Hook services per unit of pool output | 5% of swap value → hook fees |
| $a_{K \to P}$ | Capital (TVL) required per unit swap volume | Capital efficiency ratio |
| $a_{P \to P'}$ | Inter-pool flows (liquidity routing) | Aggregator routing |
| $a_{L \to H}$ | Developer labor per unit of hook output | Hook production cost structure |

### Leontief System

$$\mathbf{x} = \mathbf{A}\mathbf{x} + \mathbf{f}$$

Where:
- $\mathbf{x}$ = output vector (hooks, pools, protocols)
- $\mathbf{A}$ = matrix of technical coefficients $[a_{ij}]$
- $\mathbf{f}$ = final demand (swappers + LPs)

**Solving for total output:**

$$\mathbf{x} = (\mathbf{I} - \mathbf{A})^{-1} \mathbf{f}$$

The **Leontief inverse** $(\mathbf{I} - \mathbf{A})^{-1}$ captures direct and indirect requirements.

---

## Production Chain

```
PRIMARY FACTORS
├── Labor (developers, operators)
├── Capital (infrastructure, audits)
└── Land (blockchain compute)
        ↓
HOOK PRODUCTION (Hook Developers)
        ↓
┌─────────────────────────────────┐
│  VANILLA POOLS                  │ ← INTERMEDIATE INPUT
│  (Commoditized liquidity)       │   (homogeneous, no differentiation)
│  • Homogeneous                  │
│  • Zero economic profit         │
│  • Perfect substitutes          │
└─────────────────────────────────┘
        ↓ + Hooks (Factor Services)
┌─────────────────────────────────┐
│  ENHANCED POOLS                 │ ← PRODUCTION UNIT (FIRM)
│  (Differentiated services)      │   (competitive advantage)
│  • Heterogeneous                │
│  • Positive economic profit     │
│  • Imperfect substitutes        │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  FINAL DEMAND (End Users)       │
│  ├── Swappers (consume swaps)   │
│  └── LPs (consume yield)        │
└─────────────────────────────────┘
```

---

## Mathematical Formalization

### Value Decomposition

$$V_{pool} = \underbrace{V_{vanilla}}_{\text{Intermediate input value}} + \underbrace{V_{hooks}}_{\text{Value added by hooks}}$$

### Production Function Transformation

**Vanilla Pool** (single-factor, commodity):
$$Y_{vanilla} = f(K_{TVL})$$

**Enhanced Pool** (multi-factor, differentiated):
$$Y_{enhanced} = F(K_{TVL}, \mathbf{H})$$

The hooks ($\mathbf{H}$) transform the production function from commodity to differentiated.

### Differentiation Operator

Define $\mathcal{D}$:

$$\mathcal{D}: \text{IntermediateInput} \times \text{Hooks} \rightarrow \text{ProductionUnit}$$

$$\mathcal{D}(P_{vanilla}, \mathbf{H}) = P_{enhanced}$$

Where:
- $P_{vanilla} \in \mathcal{I}$ (intermediate input space)
- $P_{enhanced} \in \mathcal{F}$ (firm/production unit space)
- $\mathbf{H}$ = hook bundle enabling transformation

---

## SAM Implications

### I-O Matrix Before Hooks

Vanilla pools appear only as intermediate flows:

$$\mathbf{A}_{before} = \begin{bmatrix}
0 & 0 & a_{P \to Agg} \\
0 & 0 & a_{P \to Agg} \\
0 & 0 & 0
\end{bmatrix}$$

### I-O Matrix After Hooks

Pools become production units with value added:

$$\mathbf{A}_{after} = \begin{bmatrix}
H_{11} & H_{12} & 0 \\
H_{21} & H_{22} & 0 \\
\Phi_{1P} & \Phi_{2P} & 0
\end{bmatrix}$$

Now pools have:
- Hook factor income flows ($H_{ij}$)
- Hook-pool integration ($\Phi$)
- Value added component (outside A matrix)

### Complete I-O Balance

$$\underbrace{\mathbf{x}}_{\text{Total Output}} = \underbrace{\mathbf{A}\mathbf{x}}_{\text{Intermediate Demand}} + \underbrace{\mathbf{f}}_{\text{Final Demand (Swappers + LPs)}}$$

---

## Key Insight

**Hook Bazaar's economic function**: Transform commodity intermediate inputs (vanilla pools) into differentiated production units (enhanced pools) by providing factor services.

Analogous to:
- **Manufacturing**: Raw steel (intermediate) + machinery (capital) → differentiated products
- **DeFi**: Vanilla liquidity (intermediate) + hooks (factor services) → differentiated pool services

---

---

## Elaboration: Hook Factor Income Matrix $H_{ij}$

### Matrix Structure

The hook factor income matrix $\mathbf{H} = [H_{ij}]$ is an $n \times n$ matrix where $n$ is the number of distinct hook types:

$$\mathbf{H} = \begin{bmatrix}
H_{11} & H_{12} & \cdots & H_{1n} \\
H_{21} & H_{22} & \cdots & H_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
H_{n1} & H_{n2} & \cdots & H_{nn}
\end{bmatrix}$$

| Dimension | Economic Interpretation | SAM Convention |
|-----------|------------------------|----------------|
| **Row $i$** | Income receipt account | "Where income comes FROM" |
| **Column $j$** | Expenditure/disposition account | "Where income GOES TO" |

### Row Interpretation: Income Streams

Hook $i$'s total receipts:

$$R_i = \sum_{j=1}^{n} H_{ij} = H_{i,\text{fees}} + H_{i,\text{MEV}} + H_{i,\text{subsidy}} + H_{i,\text{inter-hook}}$$

| Income Type | Symbol | Source |
|-------------|--------|--------|
| Direct Fee Income | $H_{i,\text{fees}}$ | Pool swap fees allocated to hook |
| MEV Capture | $H_{i,\text{MEV}}$ | Arbitrage/sandwich extraction |
| Protocol Subsidies | $H_{i,\text{subsidy}}$ | Grants, incentives |
| Inter-Hook Transfers | $H_{ij}, i \neq j$ | Payments between composable hooks |

**"Employment in $H_j$"**: Hook $i$ is invoked during $j$'s execution path:

$$H_{ij} = \int_0^T \tau_{ij}(t) \cdot p_i(t) \cdot q_{ij}(t) \, dt$$

Where:
- $\tau_{ij}(t)$: invocation count of hook $i$ by hook $j$ at time $t$
- $p_i(t)$: price per invocation
- $q_{ij}(t)$: quality/intensity of service

### Column Interpretation: Disposition of Factor Income

How hook $j$'s generated value is distributed:

$$E_j = D_j + P_j + LP_j + S_j$$

| Recipient | Share ($\theta$) | Description |
|-----------|------------------|-------------|
| $D_j$ (Developer) | 70-90% | Hook developer earnings |
| $P_j$ (Protocol) | 5-15% | Protocol treasury |
| $LP_j$ (LP) | 0-10% | LP enhancement |
| $S_j$ (Savings) | Remainder | Reinvestment |

### Off-Diagonal Elements: Composability Flows ($i \neq j$)

$$H_{ij} \neq 0 \iff \text{Hook } i \text{ provides factor services to Hook } j$$

**Examples:**
- $H_{13}$: Oracle → Rebalancer (price data enables rebalancing)
- $H_{32}$: Fee Hook → Oracle (fee hook pays for volatility data)
- $H_{41}$: Rebalancer → MEV Protection (pays for MEV shield)

### Competition Dynamics

Substitution effects between competing hooks:

$$\frac{\partial H_{ii}}{\partial H_{jj}} < 0 \quad \text{(Substitute hooks)}$$
$$\frac{\partial H_{ii}}{\partial H_{jj}} > 0 \quad \text{(Complement hooks)}$$

Cross-price elasticity:
$$\epsilon_{ij} = \frac{\partial \ln Q_i}{\partial \ln p_j}$$

### Accounting Identity

$$\boxed{\sum_j H_{ij} = \sum_j H_{ji} + \text{Net external flows}}$$

Row totals must equal column totals for SAM balance.

### Example Calibrated Matrix (ETH/week)

|  | $H_1$ (Rebalancer) | $H_2$ (Fee Adj) | $H_3$ (Oracle) | $H_4$ (MEV Prot) | **Row Total** |
|--|-------------------|-----------------|----------------|------------------|---------------|
| $H_1$ | **12.5** | 0.8 | 0 | 1.2 | 14.5 |
| $H_2$ | 0.3 | **8.7** | 2.1 | 0.5 | 11.6 |
| $H_3$ | 1.5 | 1.8 | **4.2** | 0.9 | 8.4 |
| $H_4$ | 0.7 | 0.4 | 0.3 | **6.1** | 7.5 |
| **Col Total** | 15.0 | 11.7 | 6.6 | 8.7 | **42.0** |

---

## Hook Redeployability

> **Definition**: The degree to which a Uniswap V4 hook can be productively integrated across heterogeneous protocol pools without substantial adaptation costs, measured by the weighted compatibility of hook design with the state variable schemas, callback interfaces, and business model requirements of alternative deployment targets.

### Terminology Comparison

| Term | Source Domain | Limitation for Hooks |
|------|---------------|---------------------|
| Factor Mobility | Labor Economics | Too macro-level (countries/sectors) |
| Asset Specificity | Transaction Cost Economics (Williamson) | Focuses on the *problem* (lock-in), not the *solution* |
| Portability | Immigration Economics | More commonly used for human capital |
| Fungibility | Finance | Too strong—hooks are differentiated, not identical |
| Composability | DeFi | Describes *what* happens, not the friction of doing so |
| **Redeployability** | Corporate Finance (Kim & Kung, 2017) | ✓ Directly captures integration friction |

### Theoretical Foundations

#### Transaction Cost Economics (Williamson)

**Asset Specificity** has four dimensions relevant to hooks:

| Specificity Type | Hook Manifestation |
|------------------|-------------------|
| Site specificity | Hook designed for specific chain/L2 environment |
| Physical asset specificity | State variable structures, data schemas |
| Human asset specificity | Developer knowledge of particular hook's internals |
| Dedicated assets | Integration code, adapters, testing infrastructure |

The **hold-up problem** arises when hooks require relationship-specific investments that create bilateral dependency and reduce redeployability.

#### Labor Economics: Skill Transferability

From Gathmann & Schonberg (2010) on task-specific human capital:
- Skills are more portable than thought when *tasks* are similar
- Wage losses depend on switching *skill portfolios*, not occupation codes

**Hook analog**: Integration costs depend on "hook distance"—how different the target pool's requirements are from the hook's native design.

#### Platform Economics: Multi-homing

From Bank of England Working Paper 839:

| Cost Type | Definition | Hook Application |
|-----------|------------|------------------|
| Multi-homing costs | Fixed costs of maintaining presence on multiple platforms | Maintaining hook across multiple pool architectures |
| Switching costs | One-time costs of moving between platforms | Migrating hook from Pool A to Pool B |
| Data portability | Ability to transfer state/history | Hook state migration across protocols |

### Mathematical Formalization

#### Redeployability Index

Adapted from Kim & Kung (2017):

$$\rho_h = \sum_{p \in \mathcal{P}} \omega_p \cdot \text{Compatibility}(h, p)$$

Where:
- $\rho_h \in [0,1]$: Redeployability index for hook $h$
- $\omega_p$: Importance weight of pool $p$ (e.g., TVL share)
- $\text{Compatibility}(h, p) \in [0,1]$: Degree to which hook $h$ integrates with pool $p$

#### Integration Cost Function

$$C_{\text{int}}(h, p) = \alpha \cdot d_{\text{state}}(h, p) + \beta \cdot d_{\text{flow}}(h, p) + \gamma \cdot d_{\text{model}}(h, p)$$

Where:
- $d_{\text{state}}(h, p)$: State variable distance (schema incompatibility)
- $d_{\text{flow}}(h, p)$: Flow incompatibility (callback sequence mismatch)
- $d_{\text{model}}(h, p)$: Business model mismatch (revenue structure)
- $\alpha, \beta, \gamma$: Weighting coefficients

#### Hook Distance Metric

Analogous to occupational distance in labor economics:

$$D(h; p_1, p_2) = \|\mathbf{r}_{p_1} - \mathbf{r}_{p_2}\|$$

Where $\mathbf{r}_p$ is the **requirement vector** for pool $p$, capturing:
- Callback interfaces required
- State variable schemas
- Gas efficiency constraints
- Security assumptions

### Barriers to Redeployability

| Barrier | Description | Williamson Classification |
|---------|-------------|--------------------------|
| **State Variable Heterogeneity** | Each protocol defines state variables differently | Physical asset specificity |
| **Flow Incompatibility** | Different transaction flows and callback sequences | Site specificity |
| **Business Model Divergence** | Revenue models vary (fixed fee, dynamic, revenue share) | Dedicated assets |
| **Security Assumptions** | Different trust models and audit requirements | Human asset specificity |

### Market Segmentation Effects

Low hook redeployability creates **segmented factor markets**:

$$p_h^{(A)} \neq p_h^{(B)} \quad \text{when } \rho_h \approx 0$$

Where $p_h^{(A)}$ and $p_h^{(B)}$ are prices for hook $h$ in protocols A and B.

**Economic consequences**:
- Price discovery is impaired (fewer competing hooks per pool)
- Rent extraction by pools that have captured specific hooks
- Reduced allocative efficiency across the ecosystem

### Policy Interventions to Increase Redeployability

| Intervention | Source | Hook Bazaar Implementation |
|--------------|--------|---------------------------|
| **Standardization** | TCE | Common callback interfaces (ERC-style standards) |
| **Modular Design** | Software Engineering | Separate hook logic from pool-specific adapters |
| **Data Portability** | Platform Economics | Standardized hook state interfaces |
| **Transparent Registries** | Information Economics | Capability metadata, audit status |
| **Adapter Layers** | DeFi Composability | Diamond pattern with facet abstraction |

**Hook Bazaar's role**: Increase $\rho_h$ through standardized interfaces, adapter layers, and reputation portability.

---

## Protocol SAM Structure ($P_{ij}$)

### Ontological Classification

Protocols occupy a **hybrid position** in the SAM:

| SAM Role | Traditional Economy | DeFi Protocol Analog | Justification |
|----------|---------------------|---------------------|---------------|
| **Activity** | Industry/Production | Pool operations | Protocols "produce" liquidity services |
| **Institution** | Government/Households | Governance layer | Protocols coordinate factor allocation |
| **Factor Owner** | Land, Labor, Capital | Smart contract owner | Protocols own pool infrastructure |

The appropriate representation is a **dual-account structure**:

$$\mathbf{P} = \mathbf{P}^{A} \oplus \mathbf{P}^{I}$$

Where:
- $\mathbf{P}^{A}$: Protocol Activity accounts (production/consumption of hook services)
- $\mathbf{P}^{I}$: Protocol Institutional accounts (governance, transfers, coordination)

### Protocol Activity Matrix $P^{A}_{ij}$

The protocol activity matrix captures protocols as **consumers of hook factor services**:

$$\mathbf{P}^{A} = [P^{A}_{ij}] \quad \text{where } i \in \{1,...,m\}, j \in \{1,...,m\}$$

| Dimension | Interpretation |
|-----------|---------------|
| Row $i$ | Protocol $i$'s **receipts** from providing pool services |
| Column $j$ | Protocol $j$'s **expenditures** on inputs (including hooks) |

**Column Structure (Expenditures by Protocol $j$)**:

$$E_j^{P} = \underbrace{\sum_{h=1}^{n} F_{hj}}_{\text{Hook Factor Payments}} + \underbrace{L_j + K_j}_{\text{Primary Factors}} + \underbrace{T_j^{import}}_{\text{Intermediate Imports}}$$

Where:
- $F_{hj}$: Payment to hook $h$ by protocol $j$
- $L_j$: Developer labor costs
- $K_j$: Infrastructure capital costs
- $T_j^{import}$: Imported services from other protocols

### Protocol Institutional Matrix $P^{I}_{ij}$

Protocols exercise institutional functions analogous to government:

| Entry | Description |
|-------|-------------|
| $P^{I}_{HH}$ | Hook-to-hook inter-protocol transfers |
| $P^{I}_{HP}$ | Hook income paid to protocol treasuries |
| $P^{I}_{PL}$ | Protocol distributions to LPs |
| $P^{I}_{PS}$ | Protocol savings/reinvestment |
| $P^{I}_{PM}$ | Protocol payments to marketplace (Hook Bazaar) |

### Quasi-Governmental Functions

| Government Function | Protocol Analog | SAM Account |
|--------------------|-----------------|-------------|
| **Taxation** | Protocol fees on swaps | $P^{I}_{fee}$ |
| **Redistribution** | Fee distribution to LPs | $P^{I}_{PL}$ |
| **Public Goods** | Pool infrastructure | $P^{A}_{infra}$ |
| **Regulation** | Hook selection/governance | $P^{I}_{gov}$ |
| **Monetary Policy** | Dynamic fee adjustment | $P^{I}_{dyn}$ |

---

## Hook-Protocol Integration Matrix $\Phi$

### Formal Linkage Structure

The connection between protocol accounts ($P$) and hook accounts ($H$) is mediated by an **integration matrix** $\Phi$:

$$\Phi: \mathbf{H} \times \mathbf{P}^{A} \rightarrow \mathbb{R}^{n \times m}$$

Where $\Phi_{hp}$ represents hook $h$'s value contribution to protocol $p$.

### Revenue Share Model Mapping

Three pricing models map to SAM entries:

**Model 1: Fixed Price (One-time)**

$$\Phi_{hp}^{fixed} = \pi_h \cdot \mathbb{1}_{t=0}$$

SAM entry: Single capital transfer from protocol to hook developer at $t=0$.

**Model 2: Revenue Share**

$$\Phi_{hp}^{share}(t) = \theta_h \cdot \phi_p(t) \cdot V_p(t)$$

Where:
- $\theta_h \in [0, 0.3]$: Hook's revenue share (capped at 30%)
- $\phi_p(t)$: Pool $p$'s swap fee rate
- $V_p(t)$: Swap volume at time $t$

SAM entries: Continuous flow from pool fee account to hook income account.

**Model 3: Hybrid**

$$\Phi_{hp}^{hybrid} = \pi_h^{fixed} + \int_0^T \theta_h \cdot \phi_p(t) \cdot V_p(t) \, dt$$

### Matrix Entry Specification

For each $(h, p)$ pair:

$$\Phi_{hp} = \begin{cases}
\pi_h & \text{if fixed price} \\
\sum_{t=1}^{T} \theta_h \phi_p V_{pt} & \text{if revenue share} \\
\pi_h + \sum_{t=1}^{T} \theta_h \phi_p V_{pt} & \text{if hybrid}
\end{cases}$$

---

## Complete SAM Block Structure

### Full Hook Bazaar SAM

$$\mathbf{SAM} = \begin{bmatrix}
\mathbf{H} & \mathbf{\Phi} & \mathbf{0} & \mathbf{\Omega}_H \\
\mathbf{\Phi}^T & \mathbf{P}^A & \mathbf{\Lambda} & \mathbf{\Omega}_P \\
\mathbf{0} & \mathbf{\Lambda}^T & \mathbf{E} & \mathbf{\Omega}_E \\
\mathbf{\Omega}_H^T & \mathbf{\Omega}_P^T & \mathbf{\Omega}_E^T & \mathbf{I}
\end{bmatrix}$$

Where:
- $\mathbf{H}$: Hook factor accounts ($n \times n$)
- $\mathbf{P}^A$: Protocol activity accounts ($m \times m$)
- $\mathbf{E}$: External agent accounts (LPs, swappers, developers)
- $\mathbf{I}$: Institutional accounts (protocol treasuries, marketplace)
- $\mathbf{\Phi}$: Hook-Protocol integration matrix ($n \times m$)
- $\mathbf{\Lambda}$: Protocol-External flows ($m \times k$)
- $\mathbf{\Omega}$: Cross-block transfer matrices

### Accounting Identities

**Identity 1: Hook Income Balance**

$$\sum_j H_{ij} = \sum_j H_{ji} + \sum_p \Phi_{ip} + \Omega_{iE}$$

**Identity 2: Protocol Activity Balance**

$$\sum_h \Phi_{hp} + \sum_q P^A_{qp} = \sum_h \Phi_{ph} + \sum_q P^A_{pq} + \Lambda_p$$

**Identity 3: SAM Global Balance**

$$\sum_{i} R_i = \sum_{j} E_j$$

**Identity 4: Multi-Sided Market Balance**

For each agent class $c \in \{D, P, L, S\}$ (Developers, Protocols, LPs, Swappers):

$$\sum_{i \in c} \text{Income}_i = \sum_{j \in c} \text{Expenditure}_j + \text{Net Savings}_c$$

### Integrated SAM Example (ETH/week)

|  | $H_1$ | $H_2$ | $H_3$ | $H_4$ | $P_1$ | $P_2$ | LP | Swap | **Row** |
|--|-------|-------|-------|-------|-------|-------|-----|------|---------|
| $H_1$ | 12.5 | 0.8 | 0 | 1.2 | **3.5** | **2.0** | 0 | 0 | 20.0 |
| $H_2$ | 0.3 | 8.7 | 2.1 | 0.5 | **1.8** | **1.2** | 0 | 0 | 14.6 |
| $H_3$ | 1.5 | 1.8 | 4.2 | 0.9 | **0.9** | **0.7** | 0 | 0 | 10.0 |
| $H_4$ | 0.7 | 0.4 | 0.3 | 6.1 | **1.3** | **0.6** | 0 | 0 | 9.4 |
| $P_1$ | 0 | 0 | 0 | 0 | 0 | 5.2 | **8.5** | **22.3** | 36.0 |
| $P_2$ | 0 | 0 | 0 | 0 | 4.8 | 0 | **6.2** | **18.5** | 29.5 |
| LP | 0 | 0 | 0 | 0 | 18.2 | 14.8 | 0 | 0 | 33.0 |
| Swap | 0 | 0 | 0 | 0 | 0 | 0 | 18.3 | 0 | 18.3 |
| **Col** | 15.0 | 11.7 | 6.6 | 8.7 | 30.5 | 24.5 | 33.0 | 40.8 | **170.8** |

**Bold entries** = $\Phi$ matrix (hook-protocol linkages)

---

## Market Failure Representation in SAM

### SAM Diagnosis of Market Failures

The nine market failures from the Problem Description map to SAM structural deficiencies:

| Market Failure | SAM Symptom | Missing Flow |
|----------------|-------------|--------------|
| **1. Missing Marketplace** | $\Phi_{hp} = 0 \; \forall h,p$ | Hook-protocol linkage |
| **2. High Barriers** | $P^A_{entry} \gg 0$ | Capital-to-production flow blocked |
| **3. No Incentive Layer** | $T_{PH} = 0$ | Developer income channel |
| **4. No Standardization** | $\text{Var}(H_{ij}) \rightarrow \infty$ | Incomparable hook accounts |
| **5. No Composition** | $H_{ij} = 0 \; \forall i \neq j$ | Inter-hook value flows |
| **6. No Competition** | $\partial H_{ii}/\partial H_{jj} = 0$ | Substitution effects absent |
| **7. No IP Protection** | $\theta_h \rightarrow 0$ | Developer income eroded |
| **8. No Reputation** | $\alpha_p(h) \sim \text{Uniform}$ | Information asymmetry |
| **9. Unsustainable Economics** | $\sum_t R_h < \sum_t C_h$ | Negative NPV for developers |

### Formal Market Failure Conditions

**Definition (Missing Market)**: A market $M_{hp}$ between hook $h$ and protocol $p$ is **missing** iff:

$$\Phi_{hp} = 0 \quad \text{and} \quad \exists \; \text{gains from trade} \; (V_h^* > V_h^{autarky}, V_p^* > V_p^{autarky})$$

**Definition (Blocked Flow)**: A SAM flow $F_{ij}$ is **blocked** iff:

$$F_{ij} = 0 \quad \text{while} \quad \partial U_i / \partial F_{ij} > 0 \quad \text{and} \quad \partial U_j / \partial F_{ij} > 0$$

### How Hook Bazaar "Completes" the SAM

**Before Hook Bazaar** (sparse, missing markets):

$$\mathbf{SAM}_{before} = \begin{bmatrix}
\mathbf{H}_{sparse} & \mathbf{0} & \mathbf{0} \\
\mathbf{0} & \mathbf{P}^A_{isolated} & \mathbf{\Lambda} \\
\mathbf{0} & \mathbf{\Lambda}^T & \mathbf{E}
\end{bmatrix}$$

**After Hook Bazaar** (dense, functioning markets):

$$\mathbf{SAM}_{after} = \begin{bmatrix}
\mathbf{H}_{dense} & \mathbf{\Phi} & \mathbf{\Omega}_H \\
\mathbf{\Phi}^T & \mathbf{P}^A_{integrated} & \mathbf{\Lambda} \\
\mathbf{\Omega}_H^T & \mathbf{\Lambda}^T & \mathbf{E}
\end{bmatrix}$$

### Market Completion Effects

| SAM Region | Before | After | Economic Effect |
|------------|--------|-------|-----------------|
| $\mathbf{\Phi}$ | Zero matrix | Dense | Hook factor market activated |
| $\mathbf{H}$ diagonal | Sparse | Dense | Hook specialization |
| $\mathbf{H}$ off-diagonal | Zero | Positive | Composability value |
| $\mathbf{\Omega}_H$ | Zero | Positive | Developer income |
| $\mathbf{P}^A$ | Isolated | Integrated | Protocol efficiency gains |

---

## Notation Summary

| Symbol | Dimension | Description |
|--------|-----------|-------------|
| $\mathbf{H}$ | $n \times n$ | Hook factor income matrix |
| $\mathbf{P}^A$ | $m \times m$ | Protocol activity matrix |
| $\mathbf{P}^I$ | $m \times m$ | Protocol institutional matrix |
| $\mathbf{\Phi}$ | $n \times m$ | Hook-Protocol integration matrix |
| $\mathbf{\Lambda}$ | $m \times k$ | Protocol-External flow matrix |
| $\mathbf{T}$ | $(n+m+k)^2$ | Transfer matrix |
| $\theta_h$ | Scalar | Revenue share rate for hook $h$ |
| $\alpha_p(h)$ | Scalar | Protocol $p$'s selection probability for hook $h$ |
| $\rho_h$ | Scalar | Redeployability index for hook $h$ |

---

## References

### SAM and General Equilibrium

1. Arrow, K. J., & Debreu, G. (1954). Existence of an equilibrium for a competitive economy. *Econometrica*, 22(3), 265-290.

2. Leontief, W. W. (1936). Quantitative input and output relations in the economic systems of the United States. *Review of Economics and Statistics*, 18(3), 105-125.

3. Pyatt, G., & Round, J. I. (1979). Accounting and fixed price multipliers in a social accounting matrix framework. *Economic Journal*, 89(356), 850-873.

4. Samuelson, P. A. (1953). Prices of factors and goods in general equilibrium. *Review of Economic Studies*, 21(1), 1-20.

5. Reinert, K. A., & Roland-Holst, D. W. (1997). Social Accounting Matrices. In *Applied Methods for Trade Policy Analysis*, 94-121. Cambridge University Press.

6. Sraffa, P. (1960). *Production of Commodities by Means of Commodities*. Cambridge University Press.

### Transaction Cost Economics

7. Williamson, O. E. (2009). Transaction Cost Economics: The Natural Progression. *Nobel Prize Lecture*. https://www.nobelprize.org/uploads/2018/06/williamson_lecture.pdf

8. Tadelis, S., & Williamson, O. E. (2012). Transaction Cost Economics. In *Handbook of Organizational Economics*. https://faculty.haas.berkeley.edu/stadelis/tce_org_handbook_111410.pdf

### Asset Redeployability

9. Kim, H., & Kung, H. (2017). The Asset Redeployability Channel: How Uncertainty Affects Corporate Investment. *Review of Financial Studies*, 30(1), 245-280. https://academic.oup.com/rfs/article-abstract/30/1/245/2669940

### Labor Economics and Skill Transferability

10. Gathmann, C., & Schonberg, U. (2010). How General Is Human Capital? A Task-Based Approach. *Journal of Labor Economics*, 28(1), 1-49. https://www.journals.uchicago.edu/doi/10.1086/649786

11. NBER Working Paper 32908 (2024). Skills and Human Capital. https://www.nber.org/papers/w32908

### Platform Economics

12. Rochet, J. C., & Tirole, J. (2003). Platform Competition in Two-Sided Markets. *Journal of the European Economic Association*, 1(4), 990-1029.

13. Bank of England (2019). Platform Competition and Data Portability. *Working Paper 839*. https://ideas.repec.org/p/boe/boeewp/0839.html

14. Lam, W. M. W. (2017). Switching Costs in Two-Sided Markets. *Journal of Industrial Economics*. https://onlinelibrary.wiley.com/doi/10.1111/joie.12133

### DeFi and Composability

15. von Wachter, V., Jensen, J. R., & Ross, O. (2021). Measuring Asset Composability as a Proxy for DeFi Integration. *arXiv:2102.04227*. https://arxiv.org/abs/2102.04227

16. Bartoletti, M., Chiang, J. H., & Lluch-Lafuente, A. (2023). A Theory of Compositionality for Smart Contracts. *arXiv:2309.10781*. https://arxiv.org/abs/2309.10781

17. Schär, F. (2021). Decentralized Finance: On Blockchain and Smart Contract-Based Financial Markets. *Federal Reserve Bank of St. Louis Review*. https://www.stlouisfed.org/publications/review/2021/02/05/decentralized-finance-on-blockchain-and-smart-contract-based-financial-markets

18. Adams, H., et al. (2024). Uniswap V4 Core. *Uniswap Labs Technical Documentation*.

