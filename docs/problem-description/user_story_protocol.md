# Protocol User Story: Self-Building a Hook (Gamma Spec)

## Overview

**Story**: A protocol team decides to build their own Uniswap V4 hook. We follow their journey through build → test → audit, watching costs and time accumulate.

**Tool**: Gamma Pro
**Duration**: ~90 seconds (6 scenes)
**Tone**: Realistic, slightly tense as costs mount
**Source**: [Protocol_Cost_Function.md](./Protocol_Cost_Function.md)

**IMPORTANT - Slide Titles**: Only Slide 1 has a title: **"Meet DeFiSuperStars"**. All other slides have NO title.

---

## Cost Figures (from Protocol_Cost_Function.md)

### Developer Rates
| Level | Hourly Rate |
|-------|-------------|
| Mid-level | $65-100/hr |
| Senior | $100-150/hr |
| Expert | $150-350/hr |
| **Average used** | **$100/hr** (~$2.35/min for animation) |

### Cost Targets (Simple Hook)
| Phase | Cost | Time |
|-------|------|------|
| C_dev | $3k - $10k | 1-2 weeks |
| C_test | $1k - $3k | 3-5 days |
| C_audit | $5k - $15k | 1-2 weeks |
| **C_total** | **$8k - $25k** | **2-4 weeks** |

### Cost Targets (Complex Hook)
| Phase | Cost | Time |
|-------|------|------|
| C_dev | $20k - $60k | 4-8 weeks |
| C_test | $5k - $15k | 1-2 weeks |
| C_audit | $30k - $100k | 2-4 weeks |
| **C_total** | **$50k - $170k** | **2-6 months** |

---

## Scene Breakdown

### Scene 1: The Decision
**Duration**: 10-15 seconds

**Slide Title**: "Meet DeFiSuperStars" (ONLY slide with a title)

**Visual**: Conference room / video call with protocol team

**Content**:
```
[Team around table or on video call]

CTO: "We're launching a liquidity bootstrapping pool
      for our yield-bearing token sDeFiSuperStars next month."

Dev Lead: "We need a dynamic fee hook to stay competitive.
          Let's build it ourselves - how hard can it be?"

[Everyone nods confidently]
```

**Elements**:
- 3-4 stick figures (simple developer style)
- Speech bubbles with dialogue
- DeFiSuperStars logo/icon in background
- sDeFiSuperStars token symbol
- Hook icon appears when mentioned

**Gamma Prompt**:
```
Create a slide showing a protocol team meeting.

SLIDE TITLE: "Meet DeFiSuperStars" (this is the ONLY slide with a title)

Scene: Video call or conference room with 3-4 stick figures.

Dialogue (as speech bubbles or text overlays):
- "We're launching a liquidity bootstrapping pool for sDeFiSuperStars"
- "We need a dynamic fee hook to stay competitive"
- "Let's build it ourselves!"

Show DeFiSuperStars logo and sDeFiSuperStars token symbol.
Show a Uniswap V4 hook icon appearing.
Mood: Optimistic, confident.

Use simple stick figures for all characters (circle head, line body).
Animate dialogue appearing sequentially.

NOTE: No other slides should have titles - only this first slide.
```

---

### Scene 2: Building Phase
**Duration**: 20-25 seconds

**Visual**: Developer at desk, coding. Two counters on the side.

**Animation Flow**:
```
[Developer typing at computer]

COST COUNTER (right side):
$0 → $100 → $500 → $1,000 → ... → $10,000
(increments by ~$2.35/tick, representing $100/hr)

TIME COUNTER (right side):
Day 1 → Day 3 → Day 7 → Day 10 → Day 14
(2 weeks total)

CODE ELEMENTS appearing:
- "Setting up infra..."
- "Building API..."
- "Integrating AI oracle..."
- "Implementing callbacks..."
```

**Final State**:
```
┌─────────────────────────────────┐
│ [Developer coding]    $10,000  │
│                       ████████ │
│  > deploy hook...     Week 2   │
│                       ████████ │
│                                │
│  C_dev = $10,000 ✓            │
└─────────────────────────────────┘
```

**Gamma Prompt**:
```
Create an animated slide showing a developer building a hook.

Left side: Stick figure at computer (simple: O head, | body), typing animation.
Code snippets appearing:
- "Setting up infrastructure..."
- "Building hook API..."
- "Implementing callbacks..."

Right side: Two animated counters:
1. COST: Starting at $0, incrementing to $10,000
   - Show dollar amounts growing: $0 → $2,500 → $5,000 → $7,500 → $10,000

2. TIME: Starting at Day 1, reaching Week 2
   - Show: Day 1 → Day 7 → Day 14

End state: "C_dev = $10,000 ✓" with checkmark

Dark theme, green progress bars, monospace font for code.
Animate counters incrementing smoothly.
```

---

### Scene 3: Testing Phase
**Duration**: 15-20 seconds

**Visual**: Same developer, now running tests. Counters continue.

**Animation Flow**:
```
[Terminal showing test output]

COST COUNTER continues:
$10,000 → $11,000 → $12,000 → $13,000
(+$3,000 for testing)

TIME COUNTER continues:
Week 2 → Week 2.5 → Week 3

TEST ELEMENTS:
- "Running fuzzers... 🔄"
- "Formal verification... 🔄"
- "Integration tests... ✓"
- "Edge cases... ✓"
```

**Final State**:
```
┌─────────────────────────────────┐
│ [Terminal with tests]  $13,000 │
│                        ████████│
│  ✓ 247 tests passed    Week 3  │
│                        ████████│
│                                │
│  C_test = $3,000 ✓             │
│  Running total: $13,000        │
└─────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a slide showing the testing phase.

Left side: Terminal/console showing test output:
- "Running fuzzer... 1000 iterations"
- "Formal verification... checking invariants"
- "✓ 247 tests passed"

Right side: Counters (continuing from previous):
1. COST: $10,000 → $13,000 (adding $3,000)
2. TIME: Week 2 → Week 3

Show test tools mentioned:
- Foundry fuzzer icon
- Formal methods icon

End state: "C_test = $3,000 ✓"
Show running total: "$13,000"

Dark theme, terminal green text (#00FF00), animate test results appearing.
```

---

### Scene 4: Audit Phase
**Duration**: 20-25 seconds

**Visual**: Handoff to auditors, waiting, receiving report.

**Animation Flow**:
```
[Calendar pages flipping / Clock spinning]

COST COUNTER jumps:
$13,000 → $15,000 → $20,000 → $25,000 → $28,000
(Audit costs $15,000)

TIME COUNTER:
Week 3 → Week 4 → Week 5 → Week 6

AUDIT ELEMENTS:
- "Submitting to Sherlock... 📤"
- "Waiting for auditors... ⏳"
- "Review in progress... 🔍"
- "3 findings: 1 high, 2 medium"
- "Fixes applied... ✓"
```

**Final State**:
```
┌─────────────────────────────────┐
│ [Audit report icon]    $28,000 │
│                        ████████│
│  AUDIT COMPLETE        Week 6  │
│  1 High (fixed)        ████████│
│  2 Medium (fixed)              │
│                                │
│  C_audit = $15,000 ✓           │
│  Running total: $28,000        │
└─────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a slide showing the audit phase.

Visual progression:
1. "Submitting to auditors..." with upload icon
2. Calendar/clock showing time passing (weeks)
3. "Audit in progress..." with magnifying glass
4. Audit report appearing with findings

Right side counters:
1. COST: $13,000 → $28,000 (adding $15,000 for audit)
2. TIME: Week 3 → Week 6

Show audit findings:
- "1 High severity (fixed)"
- "2 Medium severity (fixed)"

End state: "C_audit = $15,000 ✓"
Running total prominently: "$28,000"

Dark theme, use red for "High severity", orange for "Medium".
Animate calendar pages flipping to show time passing.
```

---

### Scene 5: Total Cost Reveal
**Duration**: 10-15 seconds

**Visual**: All costs stack up, final total revealed dramatically.

**Animation Flow**:
```
[Cost components fly in and stack]

C_dev   = $10,000  ████████████
C_test  = $3,000   ████
C_audit = $15,000  ██████████████████
─────────────────────────────────
C_total = $28,000

TIME: 6 weeks

[Numbers pulse/glow on final reveal]
```

**Gamma Prompt**:
```
Create a dramatic cost summary slide.

Show three cost bars stacking vertically:
- C_dev = $10,000 (blue bar)
- C_test = $3,000 (yellow bar)
- C_audit = $15,000 (red bar, largest)

Animate bars flying in from left, stacking.

Below the stack, reveal total:
"C_total = $28,000"
(Large, bold, slight glow effect)

Side callout: "TIME: 6 weeks"

Add context: "This was a SIMPLE hook. Complex hooks cost $50k-$170k+"

Dark theme, dramatic reveal animation for the total.
```

---

### Scene 6: Success... But At What Cost?
**Duration**: 10-15 seconds

**Visual**: Hook successfully integrated into pool, but cost/time prominently shown.

**Animation Flow**:
```
[Pool diagram with hook integrated]

        ┌──────────────────────────────┐
        │  sDeFiSuperStars LBP Pool    │
        │       ┌───────┐              │
        │       │ HOOK  │ ✓            │
        │       └───────┘              │
        └──────────────────────────────┘

FINAL STATS (overlay):
✓ Hook deployed to sDeFiSuperStars pool
✓ $28,000 spent
✓ 6 weeks elapsed
? Was it worth it?
```

**Gamma Prompt**:
```
Create a final slide showing successful hook integration.

Center: Simple pool diagram with hook inside:
- Rectangle labeled "sDeFiSuperStars LBP Pool"
- Smaller rectangle inside labeled "HOOK" with checkmark

Overlay stats (bottom or side):
- "✓ Hook deployed successfully"
- "✓ $28,000 spent"
- "✓ 6 weeks elapsed"

End with question: "Was it worth it?"
(This sets up the Hook Bazaar solution in next presentation)

Dark theme, green checkmarks, slight tension in the "Was it worth it?" text.
Animate: Pool appears, hook slides in, stats reveal one by one.
```

---

## Animation Timing Summary

| Scene | Duration | Cumulative |
|-------|----------|------------|
| 1. Decision | 12s | 12s |
| 2. Building | 22s | 34s |
| 3. Testing | 18s | 52s |
| 4. Audit | 22s | 74s |
| 5. Total Reveal | 12s | 86s |
| 6. Success | 12s | **98s** |

**Total runtime**: ~1:40

---

## Counter Animation Specs

### Cost Counter
```
Start: $0
Increment: ~$2.35 per tick (representing $100/hr developer rate)
Milestones:
- $10,000 (end of build)
- $13,000 (end of test)
- $28,000 (end of audit)
Format: "$XX,XXX" with comma separator
Color: White, turns red when exceeding $20k
```

### Time Counter
```
Start: Day 1
Format: "Day X" → "Week X"
Milestones:
- Day 14 / Week 2 (end of build)
- Day 21 / Week 3 (end of test)
- Day 42 / Week 6 (end of audit)
Color: White, progress bar underneath
```

---

## Visual Style (Black & White + Colored Edges)

**Colors aligned with Hook Bazaar Design System (from frontend.md)**

| Element | Specification |
|---------|---------------|
| Background | Pure white (#FFFFFF) |
| All elements | Black (#000000) |
| Cost/Warning edges | Orange-Red outline (#E85A4F) - from logo |
| Time edges | Deep Blue outline (#003366) - from logo |
| Success edges | Gold outline (#FFD700) - primary brand color |

**Key Rule**: Everything is BLACK on WHITE. Color appears ONLY as edge highlights, outlines, or underlines - never as fills.

**Logo-Inspired Palette Reference**:
```
Gold (Primary):      #FFD700 - Success, checkmarks, positive
Orange-Red (Accent): #E85A4F - Costs, warnings, problems
Deep Blue:           #003366 - Time, neutral elements
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
  - Orange-Red (#E85A4F) edges for costs and warnings
  - Deep Blue (#003366) edges for time elements
  - Gold (#FFD700) edges for success/checkmarks
Lines should appear as if being drawn by a marker in real-time
Slight imperfections are welcome - keep it human and informal
No detailed faces - express emotion through posture and gesture
```

### 2. Minimalist Visual Language

| Element | Style |
|---------|-------|
| Background | White or very light neutral |
| Lines | Black with 1-2 accent colors only |
| Characters | **STICK FIGURES ONLY** (circle head, line body) |
| Icons | Hand-drawn style, not polished |

**Color Palette (Black & White + Logo-Inspired Colored Edges)**:
```
Background:  #FFFFFF (pure white) - SLIDE BACKGROUND IS WHITE
Lines/Fill:  #000000 (black) - all main elements
Edges only (from Hook Bazaar logo/brand):
  - Orange-Red edge (#E85A4F) - costs, warnings, problems
  - Deep Blue edge (#003366) - time elements
  - Gold edge (#FFD700) - success, checkmarks

Rule: Elements are BLACK with COLORED OUTLINES/EDGES only
No filled colors - only edge highlights
```

**Edge Color Application (Logo-Aligned)**:
| Element Type | Fill | Edge/Outline |
|--------------|------|--------------|
| Cost numbers | Black text | Orange-Red (#E85A4F) outline/underline |
| Time counters | Black text | Deep Blue (#003366) outline/underline |
| Checkmarks | Black | Gold (#FFD700) edge |
| Warning items | Black | Orange-Red (#E85A4F) edge |
| Success items | Black | Gold (#FFD700) edge |
| Neutral elements | Black | Black (no color) |

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
Large:   Headlines, totals, key numbers
Medium:  Labels, descriptions
Small:   Details, sources
Spacing: Generous whitespace between elements
```

### 5. Friendly, Neutral Tone

| Aspect | Approach |
|--------|----------|
| Characters | Simple stick figures - emotion via posture |
| Language | Simple, accessible |
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
| Circling | Emphasizing key points |
| Underlining | Highlighting important text |
| Arrows | Connecting concepts |
| Checkmarks | Completing steps |
| X marks | Showing problems/costs |

---

## Updated Scene Prompts (Whiteboard Style)

### Scene 1: The Decision (Whiteboard)
```
Create a whiteboard-style slide showing a team meeting.

SLIDE TITLE: "Meet DeFiSuperStars" (ONLY this slide has a title)

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Draw 3-4 stick figures around a table
- Speech bubbles appear as if being written
- "We need a hook for sDeFiSuperStars!" underlined in blue
- Hook icon drawn with wobbling lines

Animation: Elements drawn one-by-one, 2-3 seconds each
Colors: Black lines, blue accent for "hook"
Keep it minimal and friendly

NOTE: All other slides have NO title - only this first slide.
```

### Scene 2: Building Phase (Whiteboard)
```
Create a whiteboard-style slide showing developer coding.

Style: Hand-drawn, progressive revelation
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Draw stick figure at desk first (simple: O for head, | for body, lines for arms)
- Computer screen sketched in
- Code lines appearing as scribbles
- Cost counter drawn in RED, numbers written as if by hand:
  "$0" → "$2,500" → "$5,000" → "$10,000"
- Time counter in BLUE: "Day 1" → "Week 2"

Draw each element step-by-step
Circle the final cost "$10,000" with red marker
Add label: "C_dev" with arrow pointing to cost
```

### Scene 3: Testing Phase (Whiteboard)
```
Create a whiteboard-style testing scene.

Style: Sketch on white background
- Terminal drawn as simple rectangle
- Test results written line-by-line:
  "✓ test 1" (drawn checkmark)
  "✓ test 2"
  "✓ 247 tests passed"
- Cost counter continues: $10k → $13k (red)
- Time: Week 2 → Week 3 (blue)

Hand draws checkmarks one by one
Circle "C_test = $3,000" at the end
```

### Scene 4: Audit Phase (Whiteboard)
```
Create a whiteboard-style audit scene.

Style: Hand-drawn with emphasis on time passing
- Draw calendar pages flipping (simple rectangles)
- Clock being drawn, hands moving
- Auditor stick figure with magnifying glass
- Report document sketched
- Finding labels written: "1 High" (circled in red)
- Cost jumps: $13k → $28k (red, underlined)

Draw calendar days being crossed out
Big red circle around "$28,000"
```

### Scene 5: Total Cost Reveal (Whiteboard)
```
Create a dramatic whiteboard cost summary.

Style: Hand-drawn stacked bar chart
- Draw three horizontal bars being sketched:
  C_dev   ████████ $10,000
  C_test  ███ $3,000
  C_audit █████████████ $15,000
- Hand draws a line underneath
- Writes total: "$28,000" (large, red, circled twice)
- Writes "6 WEEKS" (blue, underlined)

Progressive: bars drawn left-to-right
Final total circled emphatically with wobbling red line
```

### Scene 6: Success...? (Whiteboard)
```
Create a whiteboard conclusion scene.

Style: Simple sketch with mixed emotions
- Draw pool as simple rectangle labeled "sDeFiSuperStars Pool"
- Draw hook inside (small box labeled "h")
- Add checkmark (green)
- But then draw the stats next to it:
  "$28,000" (red, with sad face)
  "6 weeks" (blue)
  "5-15% risk" (red, underlined)
- Hand writes: "Was it worth it?" (circled)

End with question mark being drawn large
Slight pause on the uncertainty
```

---

## Gamma Tips

1. **Use "Cards" layout** for the counter scenes - allows side-by-side content
2. **Stick figure style** - all characters as simple stick figures (circle head, line body, line limbs)
3. **Smart animation** - Gamma auto-animates between similar layouts
4. **Embed counters** - Use Gamma's number highlight feature for cost figures
5. **Export to video** for the smoothest playback

---

## Scene-to-Slide Transition Guide

**CRITICAL**: Each scene = ONE slide. To enforce scene transitions as slide transitions in Gamma:

### Structuring for Transitions

| Scene | Slide # | Transition Type | Gamma Instruction |
|-------|---------|-----------------|-------------------|
| 1. Decision | 1 | Fade In | First slide, fade from black |
| 2. Building | 2 | Wipe Left | "Continue from previous with left wipe" |
| 3. Testing | 3 | Morph | "Morph from previous slide layout" |
| 4. Audit | 4 | Push Right | "Push transition showing time passing" |
| 5. Total Reveal | 5 | Zoom In | "Zoom into the final totals" |
| 6. Success | 6 | Dissolve | "Dissolve to final state" |

### Gamma Prompt for Transitions

When prompting Gamma, explicitly state:
```
Create a presentation with 6 SLIDES (one per scene).
Each slide should have a distinct transition to the next:

Slide 1 → 2: Wipe left (starting the journey)
Slide 2 → 3: Morph (same dev, different activity)
Slide 3 → 4: Push right (time progression)
Slide 4 → 5: Zoom in (dramatic reveal)
Slide 5 → 6: Dissolve (resolution)

Do NOT combine scenes into single slides.
Each scene is a separate slide with its own transition.
```

### Manual Transition Setup in Gamma

If Gamma doesn't auto-apply transitions:

1. **Click on slide** in the left panel
2. **Click "Transition"** button (or find in slide settings)
3. **Select transition type** for each slide:
   - **Fade**: For opening/closing slides
   - **Wipe**: For progression/journey feel
   - **Morph**: For similar layouts with element changes
   - **Push**: For time-based progression
   - **Zoom**: For dramatic reveals
   - **Dissolve**: For soft endings

4. **Set duration**: 1-2 seconds per transition
5. **Preview**: Watch full presentation to verify timing

### Transition Timing per Scene

| Scene | Content Duration | Transition Duration | Total |
|-------|------------------|---------------------|-------|
| 1 | 10s | 2s fade in | 12s |
| 2 | 20s | 2s wipe | 22s |
| 3 | 16s | 1.5s morph | 17.5s |
| 4 | 20s | 2s push | 22s |
| 5 | 10s | 2s zoom | 12s |
| 6 | 10s | 1.5s dissolve | 11.5s |
| **Total** | **86s** | **11s** | **97s** |

### Alternative: Gamma "Story Mode"

For more control, use Gamma's Story Mode:
1. Create presentation in Story Mode (not deck mode)
2. Each "card" becomes a scene
3. Transitions are more fluid in Story Mode
4. Better for narrative/animation-heavy content

---

## Files Referenced

- [Protocol_Cost_Function.md](./Protocol_Cost_Function.md) - All cost data and formulas
- [Hooks.md](./Hooks.md) - Hook integration details