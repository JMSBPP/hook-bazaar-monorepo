# Hook Developer User Story: Using Hook Bazaar (Gamma Spec)

## Overview

**Story**: A skilled hook developer discovers Hook Bazaar's formal specification system. We follow their journey: write formal spec → submit for SystemStateModel validation → mint HookLicense → deploy source code → get discovered by protocols, researchers, and auditors.

**Tool**: Gamma Pro
**Duration**: ~90 seconds (7 scenes)
**Tone**: Technical empowerment, professional validation, structured success
**Contrast**: This follows the "Problem" story - same developer, now with proper infrastructure
**Source**: [user_story_hookdev.md](../problem-description/user_story_hookdev.md)

**IMPORTANT - Slide Titles**: Only Slide 1 has a title: **"Meet @eth1000xSuperDev"**. All other slides have NO title.

---

## Technical Flow Overview

### The Hook Bazaar Developer Journey

```
1. FORMAL SPEC    → Define hook state variables & IHooks entry points
2. VALIDATION     → SystemStateModel compatibility check
3. MINT LICENSE   → HookMintLicense grants submission rights
4. SUBMIT CODE    → Source code with automatic tagging & metadata
5. DISCOVERY      → Visible to Protocols, Researchers, Auditors
6. INTEGRATION    → AVS operators help verify requirements
7. REVENUE        → Built-in payment rails
```

### Key Technical Concepts

| Concept | Purpose |
|---------|---------|
| IStateView | Canonical pool state variables |
| IHooks | Entry point for hook services |
| SystemStateModel | Validates hook spec compatibility |
| HookMintLicense | NFT granting submission rights |
| AVS Operator | Helps protocols verify integration |

---

## Scene Breakdown

### Scene 1: The Formal Approach
**Duration**: 10-15 seconds

**Slide Title**: "Meet @eth1000xSuperDev" (ONLY slide with a title)

**Visual**: Developer realizes they need formal specs, not just code

**Content**:
```
[Developer at desk with formal specification document]

@eth1000xSuperDev: "I have a formal document showing how my hook
                    state variables interact with PoolManager context."

[Shows IStateView interface on screen]

@eth1000xSuperDev: "IStateView defines the canonical pool state variables.
                    IHooks is my entry point.
                    Let me build this properly with Hook Bazaar."
```

**Elements**:
- Single stick figure with formal spec document
- IStateView / IHooks code snippets on screen
- State variable diagram (hook ↔ PoolManager)
- Hook Bazaar portal appearing

**Gamma Prompt**:
```
Create a whiteboard-style slide showing developer with formal specification.

SLIDE TITLE: "Meet @eth1000xSuperDev" (this is the ONLY slide with a title)

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)

Scene: Developer at desk with formal spec document
- Stick figure holding document labeled "Hook Spec"
- Computer screen showing code snippets:
  "IStateView" (canonical state variables)
  "IHooks" (entry point)
- Simple diagram: Hook ↔ PoolManager arrows

Speech bubbles:
- "Formal spec for state variable interactions"
- "IHooks is my entry point"

Hook Bazaar logo appears with lightbulb

Animation: Spec document → code snippets → platform discovery
Colors: Black lines, gold edge for Hook Bazaar
Mood: Professional, methodical approach

NOTE: All other slides have NO title - only this first slide.
```

---

### Scene 2: Write the Hook Specification
**Duration**: 15-20 seconds

**Visual**: Developer writing formal hook specification

**Content**:
```
[Hook Specification Editor]

WRITING HOOK SPEC:
┌─────────────────────────────────────────────┐
│ HOOK SPECIFICATION                          │
│                                             │
│ Target: IHooks entry points                 │
│ State Variables:                            │
│   - Maps to IStateView canonical vars       │
│   - PoolManager context interactions        │
│                                             │
│ Service Definition:                         │
│   - Anti-snipe protection for LBP pools     │
│   - beforeSwap callback implementation      │
│                                             │
│ Formal Invariants:                          │
│   - State consistency guarantees            │
│   - AMM theory compliance                   │
└─────────────────────────────────────────────┘

"Building top-down from IHooks to achieve my goals."
```

**Gamma Prompt**:
```
Create a whiteboard-style slide showing spec writing.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)

- Stick figure developer writing specification document
- Show key elements appearing:
  "IHooks entry points" (underlined, deep blue edge)
  "IStateView canonical variables" (underlined, deep blue edge)
  "PoolManager context" (with arrows, deep blue edge)

- Draw state variable diagram:
  Hook State ↔ Pool State ↔ PoolManager

- Show service definition (gold edge):
  "Anti-snipe protection"
  "beforeSwap callback"

Speech bubble: "Top-down from IHooks"

Animation: Elements drawn step-by-step as spec builds
Colors: Black lines, deep blue (#003366) for technical, gold (#FFD700) for service
Keep technical but accessible
```

---

### Scene 3: SystemStateModel Validation
**Duration**: 15-20 seconds

**Visual**: Submitting spec for compatibility validation

**Content**:
```
[Hook Bazaar Validation Portal]

SUBMIT HOOK SPEC:
┌─────────────────────────────────────────────┐
│ SystemStateModel Compatibility Check        │
│                                             │
│ Validating...                               │
│                                             │
│ ✓ State variables mapped correctly          │
│ ✓ IHooks interface compliant                │
│ ✓ PoolManager interactions valid            │
│ ✓ AMM theory constraints satisfied          │
│ ✓ No state conflicts detected               │
│                                             │
│ RESULT: ✓ COMPATIBLE                        │
│                                             │
│ "Your spec is compatible with               │
│  the SystemStateModel!"                     │
└─────────────────────────────────────────────┘

[Celebration marks]
```

**Demo Video Placeholder**:
```
<DEMO VIDEO: SystemStateModel validation flow>
- Upload hook specification
- Automatic compatibility analysis
- State variable mapping check
- Validation result
```

**Gamma Prompt**:
```
Create a whiteboard-style validation scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)

- Stick figure developer watching validation portal (rectangle)
- Header: "SystemStateModel Compatibility Check"

- Show validation steps appearing with checkmarks:
  ✓ "State variables mapped" (gold #FFD700 checkmark)
  ✓ "IHooks compliant" (gold checkmark)
  ✓ "PoolManager valid" (gold checkmark)
  ✓ "AMM theory satisfied" (gold checkmark)
  ✓ "No conflicts" (gold checkmark)

- Big result: "COMPATIBLE ✓" (gold edge, circled with wobbling line)
- Stick figure celebrates with arms up

Include placeholder: "[DEMO VIDEO: Validation]"

Animation: Validation steps appear one by one → final result celebration
Colors: Black lines, gold (#FFD700) for checkmarks and success
This is a key milestone - formal validation!
```

---

### Scene 4: Mint HookLicense
**Duration**: 10-15 seconds

**Visual**: Minting the HookMintLicense NFT

**Content**:
```
[HookMintLicense Portal]

YOUR SPEC IS VALIDATED!
Now mint your HookMintLicense to submit source code.

┌─────────────────────────────────────────────┐
│ 🪝 HOOK MINT LICENSE                        │
│                                             │
│ License ID: #4721                           │
│ Developer: @eth1000xSuperDev                │
│ Spec Hash: 0x7a3f...                        │
│ Validated: ✓ SystemStateModel               │
│                                             │
│ RIGHTS GRANTED:                             │
│ ✓ Submit source code                        │
│ ✓ Automatic tagging                         │
│ ✓ Metadata generation                       │
│ ✓ Marketplace listing                       │
│                                             │
│ [Mint License] → ✓ Minted!                  │
└─────────────────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a whiteboard-style license minting scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)

- Stick figure developer clicking mint button
- Draw HookMintLicense as certificate/NFT card (gold #FFD700 edge)
- Show license details:
  "License ID: #4721"
  "@eth1000xSuperDev"
  "Spec Hash: 0x7a3f..."
  "✓ SystemStateModel validated" (gold checkmark)

- Draw rights granted list (gold checkmarks):
  ✓ "Submit source code"
  ✓ "Automatic tagging"
  ✓ "Metadata generation"
  ✓ "Marketplace listing"

- Mint button → "Minted!" with celebration marks
- Stick figure receives the license card

Animation: License card appears → rights unlock → mint success
Colors: Black lines, gold (#FFD700) edge for license (valuable asset)
```

---

### Scene 5: Submit Source Code
**Duration**: 15-20 seconds

**Visual**: Submitting code with automatic processing

**Content**:
```
[Source Code Submission]

SUBMIT WITH HOOKMINTLICENSE:
┌─────────────────────────────────────────────┐
│ Upload Source Code                          │
│                                             │
│ [AntiSnipeHook.sol] ✓ Uploaded              │
│                                             │
│ AUTOMATIC PROCESSING:                       │
│ ✓ Code matches spec                         │
│ ✓ Compiles successfully                     │
│ ✓ Tests pass (247/247)                      │
│                                             │
│ AUTO-GENERATED:                             │
│ ✓ Tags: [MEV-Protection] [LBP] [beforeSwap] │
│ ✓ Metadata: Category, compatibility, docs   │
│ ✓ Integration guide created                 │
│                                             │
│ STATUS: ✓ LIVE ON MARKETPLACE               │
└─────────────────────────────────────────────┘

"The system tagged it automatically and generated
 the metadata for me. Now visible on my dashboard!"
```

**Demo Video Placeholder**:
```
<DEMO VIDEO: Source code submission flow>
- Upload with HookMintLicense
- Automatic code-spec matching
- Tag and metadata generation
- Marketplace listing
```

**Gamma Prompt**:
```
Create a whiteboard-style code submission scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)

- Stick figure developer uploading file
- Draw upload interface
- Show file: "AntiSnipeHook.sol ✓" (gold checkmark)

- Draw automatic processing steps (gold checkmarks):
  ✓ "Code matches spec"
  ✓ "Compiles"
  ✓ "Tests pass"

- Show AUTO-GENERATED section (gold edge, emphasized):
  "Tags: [MEV-Protection] [LBP]" (drawn as labels)
  "Metadata: auto-created"
  "Integration guide: auto-generated"

- Big "LIVE ON MARKETPLACE" with celebration (gold edge, circled)
- Stick figure with arms up celebrating

Include placeholder: "[DEMO VIDEO: Submission]"

Animation: Upload → processing → auto-generation → live!
Speech bubble: "System tagged it automatically!"
Colors: Black lines, gold (#FFD700) edge for success and automation benefits
```

---

### Scene 6: Multi-Stakeholder Discovery
**Duration**: 15-20 seconds

**Visual**: Different stakeholders discovering and interacting with the hook

**Content**:
```
[Hook Bazaar Dashboard - Discovery]

YOUR HOOK IS DISCOVERABLE BY:

┌─────────────────────────────────────────────┐
│ 👥 PROTOCOLS                                │
│ "DeFiSuperStars wants to integrate"         │
│ → AVS Operator verifies requirements ✓      │
├─────────────────────────────────────────────┤
│ 🔬 RESEARCHERS                              │
│ "AMM Lab validated HookSpec soundness"      │
│ → Formal verification adds credibility ✓    │
├─────────────────────────────────────────────┤
│ 🔍 AUDITORS                                 │
│ "Sherlock team reviewing for audit"         │
│ → Access to code + spec + validation ✓      │
└─────────────────────────────────────────────┘

DASHBOARD STATS:
- Protocol inquiries: 8
- Research citations: 2
- Audit requests: 3

"Multiple stakeholders, one platform!"
```

**Gamma Prompt**:
```
Create a whiteboard-style multi-stakeholder scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)

Draw three boxes stacked (deep blue #003366 edges):

1. PROTOCOLS (top):
- 2-3 stick figures labeled "Protocols"
- "DeFiSuperStars wants to integrate"
- "AVS Operator verifies ✓" (gold #FFD700 checkmark)

2. RESEARCHERS (middle):
- Stick figure with magnifying glass
- "HookSpec soundness validated"
- "AMM theory compliance ✓" (gold checkmark)

3. AUDITORS (bottom):
- Stick figure with document
- "Sherlock reviewing"
- "Full access to code + spec ✓" (gold checkmark)

Side stats (deep blue edge):
- "8 protocol inquiries"
- "2 research citations"
- "3 audit requests"

Animation: Three sections reveal one by one
Colors: Black lines, deep blue (#003366) for sections, gold (#FFD700) for checkmarks
Show the ecosystem forming around the hook
```

---

### Scene 7: Call to Action
**Duration**: 10 seconds

**Visual**: Hook Bazaar developer CTA

**Content**:
```
┌─────────────────────────────────────────────┐
│                                             │
│         🪝 HOOK BAZAAR                      │
│         For Hook Developers                 │
│                                             │
│    "Formal specs. Validated code.           │
│     Professional discovery."                │
│                                             │
│    Write Spec → Validate → Mint → Deploy    │
│                                             │
│    [Write Your Hook Spec]                   │
│    [Mint HookLicense]                       │
│                                             │
│         hookbazaar.xyz/developers           │
│                                             │
└─────────────────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a whiteboard-style closing CTA for developers.

Style: Hand-drawn sketch, marker on white background
Clean, professional finish

- Draw Hook Bazaar logo (simple hook icon, gold #FFD700 edge)
- Write "For Hook Developers" underneath

- Write taglines:
  "Formal specs. Validated code."
  "Professional discovery."

- Draw the flow as simple arrow chain (deep blue #003366 arrows):
  Write Spec → Validate → Mint → Deploy

- Draw two buttons (rectangles, gold edge):
  [Write Your Hook Spec]
  [Mint HookLicense]

- Write URL: hookbazaar.xyz/developers (underlined, gold)

Animation: Logo → flow diagram → CTA buttons
Colors: Black lines, gold (#FFD700) for logo/buttons, deep blue (#003366) for flow
Keep it professional and technical
```

---

## Animation Timing Summary

| Scene | Duration | Cumulative |
|-------|----------|------------|
| 1. Formal Approach | 12s | 12s |
| 2. Write Specification | 18s | 30s |
| 3. SystemStateModel Validation | 18s | 48s |
| 4. Mint HookLicense | 12s | 60s |
| 5. Submit Source Code | 18s | 78s |
| 6. Multi-Stakeholder Discovery | 18s | 96s |
| 7. CTA | 10s | **106s** |

**Total runtime**: ~1:46

---

## Demo Video Integration Points

### Video 1: Spec Writing & Validation
**Location**: Scene 2-3
**Content**:
- Hook specification editor
- SystemStateModel validation
- Compatibility check results
**Duration**: 30-45 seconds
**Format**: Loom embed or MP4

### Video 2: License Minting & Code Submission
**Location**: Scene 4-5
**Content**:
- HookMintLicense minting
- Source code upload
- Automatic tagging demo
**Duration**: 30-45 seconds
**Format**: Loom embed or MP4

### Video 3: Dashboard & Discovery
**Location**: Scene 6
**Content**:
- Developer dashboard
- Protocol inquiries
- AVS operator verification
**Duration**: 20-30 seconds
**Format**: Loom embed or MP4

---

## Key Technical Concepts Explained

### IStateView - Canonical Pool State
```
The variables defined on IStateView represent
canonical pool state variables, regardless of
protocol semantics. All hooks use these variables.

Special cases:
- beforeSwap callbacks building AMMs
- Overwriting CFMM logic with custom logic
```

### SystemStateModel Validation
```
Ensures hook spec is compatible with:
- Pool state variable interactions
- PoolManager context requirements
- AMM theory constraints
- State consistency guarantees
```

### HookMintLicense Rights
```
NFT granting developer rights to:
1. Submit source code to platform
2. Automatic categorization & tagging
3. Metadata generation
4. Marketplace visibility
5. Revenue collection
```

### AVS Operator Role
```
Helps protocols verify:
- Hook integration requirements
- Compatibility with their pools
- Security validation status
- Recommended configurations
```

---

## Visual Style (Black & White + Colored Edges)

**Colors aligned with Hook Bazaar Design System (from frontend.md)**

| Element | Specification |
|---------|---------------|
| Background | Pure white (#FFFFFF) |
| All elements | Black (#000000) |
| Validation/Success edges | Gold outline (#FFD700) - primary brand color |
| Technical/State edges | Deep Blue outline (#003366) - from logo |
| Warnings (if any) | Orange-Red outline (#E85A4F) - from logo |

**Key Rule**: Everything is BLACK on WHITE. Color appears ONLY as edge highlights, outlines, or underlines - never as fills.

**Logo-Inspired Palette Reference**:
```
Gold (Primary):      #FFD700 - Validation success, checkmarks, license, positive
Orange-Red (Accent): #E85A4F - Warnings, errors, problems (if any)
Deep Blue:           #003366 - Technical elements, state variables, neutral
Terracotta:          #CD853F - Secondary accent (optional)
```

---

## Whiteboard Animation Aesthetics

### 1. Hand-Drawn Look ✍️

| Principle | Implementation |
|-----------|----------------|
| Lines drawn in real-time | Elements appear as if sketched by marker/pen |
| Intentional imperfections | Slight wobble, uneven lines = human feel |
| Visible hand | Optional: show hand drawing elements |
| **STICK FIGURES** | All characters MUST be stick-figure style |

**Stick-Figure Requirements**:
- All human characters as simple stick figures (circle head, line body, line limbs)
- No detailed faces - simple dots for eyes, line for mouth if needed
- Expressive through posture and gesture, not facial detail
- Consistent stick-figure proportions throughout all scenes

**Gamma Prompt Addition**:
```
Style: Whiteboard animation / hand-drawn sketch look
BLACK AND WHITE ONLY - all elements drawn in black on white background
ALL CHARACTERS MUST BE STICK FIGURES - simple circle head, line body, line limbs
Color appears ONLY as edge highlights/outlines (Hook Bazaar brand colors):
  - Deep Blue (#003366) edges for technical/state elements
  - Gold (#FFD700) edges for validation success/checkmarks
  - Orange-Red (#E85A4F) edges for any warnings
Lines should appear as if being drawn by a marker in real-time
Slight imperfections are welcome - keep it human and informal
No detailed faces - express emotion through posture and gesture
```

### 2. Minimalist Visual Language

| Element | Style |
|---------|-------|
| Background | Pure white |
| Lines | Black only |
| Characters | **STICK FIGURES ONLY** (circle head, line body) |
| Icons | Black hand-drawn style |
| Color | EDGES/OUTLINES ONLY |

**Color Palette (Black & White + Logo-Inspired Colored Edges)**:
```
Background:  #FFFFFF (pure white) - SLIDE BACKGROUND IS WHITE
Lines/Fill:  #000000 (black) - all main elements
Edges only (from Hook Bazaar logo/brand):
  - Deep Blue edge (#003366) - technical elements, state variables
  - Gold edge (#FFD700) - validation, success, license
  - Orange-Red edge (#E85A4F) - warnings (rare)

Rule: Elements are BLACK with COLORED OUTLINES/EDGES only
No filled colors - only edge highlights
```

**Edge Color Application (Logo-Aligned)**:
| Element Type | Fill | Edge/Outline |
|--------------|------|--------------|
| State variables/Technical | Black text | Deep Blue (#003366) outline |
| Validation checkmarks | Black | Gold (#FFD700) edge |
| HookMintLicense | Black | Gold (#FFD700) edge |
| Success messages | Black text | Gold (#FFD700) outline |
| Stakeholder sections | Black | Deep Blue (#003366) edge |

### 3. Progressive Revelation

| Technique | When to Use |
|-----------|-------------|
| Draw step-by-step | Each element appears as it's explained |
| Slow, deliberate | ~2-3 seconds per element |
| Linear motion | Left-to-right, top-to-bottom flow |
| No spectacle | Movement supports explanation |

**Animation Timing**:
```
Element draw-in:     2-3 seconds
Pause after element: 1 second
Transition:          1-2 seconds
Total per concept:   4-6 seconds
```

### 4. Educational Clarity

| Element | Purpose |
|---------|---------|
| Diagrams | Simplify complex concepts |
| Flowcharts | Show process steps |
| Labels | Always label key elements |
| Arrows | Connect related concepts |
| Metaphors | Use familiar visuals |

**Visual Hierarchy**:
```
Large:   Headlines, validation results, license
Medium:  Labels, descriptions
Small:   Details, sources
Spacing: Generous whitespace between elements
```

### 5. Friendly, Neutral Tone

| Aspect | Approach |
|--------|----------|
| Characters | Simple stick figures - emotion via posture |
| Language | Technical but accessible |
| Complexity | Reduced to essentials |
| Voiceover ready | Calm, narrative pacing |

### 6. Low Visual Noise

**Avoid**:
- Complex textures
- Shadows
- 3D effects
- Gradients
- Busy backgrounds

**Use**:
- Flat colors
- High contrast
- Clean lines
- Focused composition

### 7. Rhythm Over Realism

| Gesture | When to Use |
|---------|-------------|
| Drawing | Introducing new elements |
| Erasing | Correcting or transitioning |
| Circling | Emphasizing validation success |
| Underlining | Highlighting important text |
| Arrows | Connecting concepts (state flows) |
| Checkmarks | Validation steps |
| Brackets | Grouping technical concepts |

---

## Updated Scene Prompts (Whiteboard Style)

### Scene 1: Formal Approach (Whiteboard)
```
Create a whiteboard-style slide showing developer with formal spec.

SLIDE TITLE: "Meet @eth1000xSuperDev" (ONLY this slide has a title)

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Stick figure holding document labeled "Hook Spec"
- Screen showing: "IStateView" and "IHooks" (deep blue #003366 edge)
- Simple diagram: Hook ↔ PoolManager with arrows
- Hook Bazaar logo appearing (gold #FFD700 edge)

Animation: Document → code terms → platform discovery
Colors: Black lines, deep blue (#003366) for technical, gold (#FFD700) for Hook Bazaar
Mood: Professional, methodical

NOTE: All other slides have NO title - only this first slide.
```

### Scene 2: Write Specification (Whiteboard)
```
Create a whiteboard-style spec writing scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Stick figure developer writing spec document
- Key terms appearing:
  "IHooks entry point" (deep blue #003366 underline)
  "IStateView variables" (deep blue underline)
  "Service: Anti-snipe protection" (gold #FFD700 edge)
- Simple state diagram: Hook State ↔ Pool State

Animation: Spec builds piece by piece
Colors: Black lines, deep blue (#003366) for technical, gold (#FFD700) for service
Technical but clear
```

### Scene 3: Validation (Whiteboard)
```
Create a whiteboard-style validation scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Stick figure developer watching validation
- Draw "SystemStateModel Check" header (deep blue #003366 edge)
- Validation steps with checkmarks:
  ✓ State variables (gold #FFD700 checkmark)
  ✓ IHooks compliant (gold checkmark)
  ✓ PoolManager valid (gold checkmark)
  ✓ AMM theory (gold checkmark)
- Big "COMPATIBLE ✓" result (circled in gold, wobbling line)
- Stick figure celebrates with arms up

Animation: Checks appear one by one → celebration
Colors: Black lines, deep blue (#003366) for header, gold (#FFD700) for checkmarks
Key milestone moment
```

### Scene 4: Mint License (Whiteboard)
```
Create a whiteboard-style license minting scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Stick figure developer clicking mint button
- Draw HookMintLicense card (gold #FFD700 edge - valuable)
- Details: ID, developer, spec hash
- Rights listed with checkmarks (gold checkmarks):
  ✓ Submit code
  ✓ Auto-tagging
  ✓ Metadata
  ✓ Marketplace
- "Minted!" with celebration marks
- Stick figure receives the license card

Animation: License appears → rights unlock
Colors: Black lines, gold (#FFD700) edge for license (valuable asset)
```

### Scene 5: Submit Code (Whiteboard)
```
Create a whiteboard-style submission scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Stick figure developer uploading file
- Draw file upload: "AntiSnipeHook.sol" (gold #FFD700 checkmark)
- Show automatic processing (gold checkmarks):
  ✓ Matches spec
  ✓ Compiles
  ✓ Tests pass
- AUTO-GENERATED section (gold edge):
  Tags appearing: [MEV] [LBP]
  "Metadata created"
- "LIVE!" celebration (gold edge, circled)
- Stick figure with arms up celebrating

Animation: Upload → auto-process → live
Colors: Black lines, gold (#FFD700) for success and automation benefits
Emphasize automation benefits
```

### Scene 6: Multi-Stakeholder (Whiteboard)
```
Create a whiteboard-style stakeholder scene.

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)

Three sections stacked (deep blue #003366 edges):
1. PROTOCOLS: 2-3 stick figures, "AVS verifies ✓" (gold #FFD700 checkmark)
2. RESEARCHERS: Stick figure + magnifying glass, "Soundness validated ✓" (gold checkmark)
3. AUDITORS: Stick figure + document, "Full access ✓" (gold checkmark)

Side stats (deep blue edge): inquiries, citations, audit requests

Animation: Sections reveal one by one
Colors: Black lines, deep blue (#003366) for sections, gold (#FFD700) for checkmarks
Show ecosystem forming
```

### Scene 7: CTA (Whiteboard)
```
Create a whiteboard-style closing CTA.

Style: Hand-drawn sketch, marker on white background
Clean, professional finish

- Hook Bazaar logo (simple hook icon, gold #FFD700 edge)
- "For Hook Developers"
- Taglines: "Formal specs. Validated code."
- Flow: Spec → Validate → Mint → Deploy (deep blue #003366 arrows)
- Buttons: [Write Spec] [Mint License] (gold edge)
- URL: hookbazaar.xyz/developers (underlined, gold)

Animation: Logo → flow → CTA
Colors: Black lines, gold (#FFD700) for logo/buttons, deep blue (#003366) for flow
Professional finish
```

---

## Gamma Tips for This Story

1. **Technical diagrams** - Use simple boxes and arrows for state flows
2. **Stick figure style** - All characters as simple stick figures
3. **Validation emphasis** - Make SystemStateModel check feel like achievement
4. **License as NFT** - Draw HookMintLicense as valuable certificate
5. **Multi-stakeholder** - Show ecosystem value (not just protocols)
6. **Export to video** for smoothest playback

---

## Scene-to-Slide Transition Guide

**CRITICAL**: Each scene = ONE slide. To enforce scene transitions as slide transitions in Gamma:

### Structuring for Transitions

| Scene | Slide # | Transition Type | Gamma Instruction |
|-------|---------|-----------------|-------------------|
| 1. Formal Approach | 1 | Fade In | "Fade in from problem story" |
| 2. Write Spec | 2 | Wipe Left | "Wipe - building the spec" |
| 3. Validation | 3 | Morph | "Morph - spec to validation" |
| 4. Mint License | 4 | Zoom In | "Zoom into license mint" |
| 5. Submit Code | 5 | Push Up | "Push up - uploading code" |
| 6. Discovery | 6 | Split | "Split - multiple stakeholders" |
| 7. CTA | 7 | Dissolve | "Dissolve to final CTA" |

### Gamma Prompt for Transitions

When prompting Gamma, explicitly state:
```
Create a presentation with 7 SLIDES (one per scene).
Each slide should have a distinct transition to the next:

Slide 1 → 2: Wipe left (building spec)
Slide 2 → 3: Morph (spec becomes validated)
Slide 3 → 4: Zoom in (focus on license)
Slide 4 → 5: Push up (uploading code)
Slide 5 → 6: Split (multiple stakeholders)
Slide 6 → 7: Dissolve (to CTA)

Do NOT combine scenes into single slides.
Each scene is a separate slide with its own transition.
```

### Manual Transition Setup in Gamma

If Gamma doesn't auto-apply transitions:

1. **Click on slide** in the left panel
2. **Click "Transition"** button (or find in slide settings)
3. **Select transition type** for each slide:
   - **Fade**: For opening slide
   - **Wipe**: For building/progression
   - **Morph**: For transformations
   - **Zoom**: For focus moments
   - **Push**: For uploading feel
   - **Split**: For multiple sections
   - **Dissolve**: For soft endings

4. **Set duration**: 1-1.5 seconds per transition
5. **Preview**: Watch full presentation to verify timing

### Transition Timing per Scene

| Scene | Content Duration | Transition Duration | Total |
|-------|------------------|---------------------|-------|
| 1 | 10s | 1.5s fade in | 11.5s |
| 2 | 16s | 1s wipe | 17s |
| 3 | 16s | 1s morph | 17s |
| 4 | 10s | 1s zoom | 11s |
| 5 | 16s | 1s push | 17s |
| 6 | 16s | 1.5s split | 17.5s |
| 7 | 8s | 1s dissolve | 9s |
| **Total** | **92s** | **8s** | **100s** |

### Alternative: Gamma "Story Mode"

For more control, use Gamma's Story Mode:
1. Create presentation in Story Mode (not deck mode)
2. Each "card" becomes a scene
3. Transitions are more fluid in Story Mode
4. Better for technical content flow
s
---

## Key Differences from Problem Story

| Aspect | Problem Story | Solution Story |
|--------|---------------|----------------|
| Approach | Ad-hoc marketing | Formal specification |
| Validation | None | SystemStateModel |
| Rights | None | HookMintLicense |
| Discovery | 0 responses | Multi-stakeholder |
| Trust | "Who are you?" | Validated + Verified |
| Audience | Just protocols | Protocols + Researchers + Auditors |

---

## Files Referenced

- [user_story_hookdev.md (Problem)](../problem-description/user_story_hookdev.md) - Problem story spec
- Hook Bazaar developer portal documentation
- SystemStateModel technical specification
- IStateView / IHooks interface documentation
