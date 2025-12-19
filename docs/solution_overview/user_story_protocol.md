# Protocol User Story: Using Hook Bazaar (Gamma Spec)

## Overview

**Story**: Same protocol team needs a hook, but this time they use Hook Bazaar. We follow their journey: browse → purchase → deploy in minutes, showing massive cost/time savings.

**Tool**: Gamma Pro
**Duration**: ~90 seconds (7 scenes)
**Tone**: Optimistic, efficient, relief
**Contrast**: This follows the "Problem" story - same team, different outcome
**Source**: [Protocol_Cost_Function.md](../problem-description/Protocol_Cost_Function.md)

**IMPORTANT - Slide Titles**: Only Slide 1 has a title: **"Meet DeFiSuperStars"**. All other slides have NO title.

---

## Cost Comparison (from Protocol_Cost_Function.md)

### Self-Build vs Hook Bazaar

| Hook Type | Self-Build | Hook Bazaar | Savings |
|-----------|-----------|-------------|---------|
| Simple | $8k - $25k | $100 - $500 | **$7.5k - $24.5k** |
| Complex | $50k - $170k | $500 - $2k | **$49.5k - $168k** |

### Time Comparison

| Hook Type | Self-Build | Hook Bazaar | Savings |
|-----------|-----------|-------------|---------|
| Simple | 2-4 weeks | Minutes | **~4 weeks** |
| Complex | 2-6 months | Minutes | **~6 months** |

### The Key Formula

```
C_purchase(P_HaaS) < C_self

Where:
- C_purchase = Integration cost + Hook price
- C_self = C_audit + C_dev + C_test + C_opp
```

**Hook Bazaar eliminates**:
- C_audit → $0 (pre-audited)
- C_dev → $0 (pre-built)
- C_test → reduced (battle-tested)
- C_opp → minutes (instant deploy)

---

## Scene Breakdown

### Scene 1: Same Decision, Different Path
**Duration**: 10-15 seconds

**Slide Title**: "Meet DeFiSuperStars" (ONLY slide with a title)

**Visual**: Same conference room / video call (callback to Problem story)

**Content**:
```
[Team around table or on video call]

CTO: "We're launching a liquidity bootstrapping pool
      for our yield-bearing token sDeFiSuperStars next month."

Dev Lead: "We need a dynamic fee hook to stay competitive.
          Wait - what about Hook Bazaar?
          Pre-built, pre-audited hooks!"

CTO: "Let's check it out."
```

**Elements**:
- Same 3-4 stick figures as Problem story
- Speech bubbles with dialogue
- DeFiSuperStars logo in background
- Hook Bazaar logo appears with lightbulb moment

**Gamma Prompt**:
```
Create a slide showing the same protocol team meeting from before.

SLIDE TITLE: "Meet DeFiSuperStars" (this is the ONLY slide with a title)

Scene: Video call or conference room with 3-4 stick figures (same as problem story).

Dialogue (as speech bubbles or text overlays):
- "We're launching a liquidity bootstrapping pool for sDeFiSuperStars"
- "We need a dynamic fee hook to stay competitive"
- "Wait - what about Hook Bazaar?"
- "Pre-built, pre-audited hooks!"

Show DeFiSuperStars logo, then Hook Bazaar logo appearing with a lightbulb icon.
Mood: Curious, hopeful - the "aha!" moment.

Use simple stick figures (circle head, line body).
Animate dialogue sequentially, end with Hook Bazaar logo prominent.

NOTE: No other slides should have titles - only this first slide.
```

---

### Scene 2: Register Protocol
**Duration**: 10-15 seconds

**Visual**: Hook Bazaar interface - protocol registration

**Content**:
```
[Hook Bazaar Dashboard]

STEP 1: Register Protocol
- Connect wallet ✓
- Enter protocol name: "DeFiSuperStars"
- Submit registration ✓

"Welcome to Hook Bazaar!"

TIME ELAPSED: 30 seconds
```

**Demo Video Placeholder**:
```
<DEMO VIDEO: create_pool() flow>
- Show actual Hook Bazaar UI
- Wallet connection
- Protocol registration form
- Success confirmation
```

**Gamma Prompt**:
```
Create a slide showing Hook Bazaar protocol registration.

Left side: Hook Bazaar dashboard mockup showing:
- "Register Your Protocol" header
- Wallet connect button (connected ✓)
- Protocol name field: "DeFiSuperStars"
- Submit button

Right side:
- Checklist appearing:
  ✓ Wallet connected
  ✓ Protocol registered
- "Welcome to Hook Bazaar!" message

Bottom: TIME ELAPSED: 30 seconds (small, subtle)

Include placeholder text: "[DEMO VIDEO: Registration Flow]"

Dark theme, green checkmarks, Hook Bazaar branding.
Animate steps completing quickly.
```

---

### Scene 3: Browse Hooks Marketplace
**Duration**: 15-20 seconds

**Visual**: Hook Bazaar marketplace - browsing available hooks

**Content**:
```
[Hook Bazaar Marketplace]

BROWSE HOOKS:
┌─────────────────────────────────────────────┐
│ 🔍 Search: "dynamic fee"                    │
├─────────────────────────────────────────────┤
│ Dynamic Fee Hook v2.1        ⭐ 4.8         │
│ By: HookDev.eth              $299           │
│ ✓ Audited by Sherlock                       │
│ ✓ 47 pools using this hook                  │
│ [View Details] [Purchase]                   │
├─────────────────────────────────────────────┤
│ MEV Shield Hook              ⭐ 4.9         │
│ By: SecureHooks.eth          $499           │
│ ✓ Audited by Trail of Bits                  │
├─────────────────────────────────────────────┤

TIME ELAPSED: 2 minutes
```

**Demo Video Placeholder**:
```
<DEMO VIDEO: browse_hooks() flow>
- Show search functionality
- Filter by category, price, rating
- Hook details page
- Audit reports visible
```

**Gamma Prompt**:
```
Create a slide showing Hook Bazaar marketplace browsing.

Show marketplace UI mockup:
- Search bar with "dynamic fee" query
- List of hooks with:
  - Hook name and version
  - Developer name (ENS)
  - Star rating
  - Price ($299, $499)
  - "✓ Audited" badges
  - Pool usage count

Highlight one hook: "Dynamic Fee Hook v2.1"
- Price: $299
- "✓ Audited by Sherlock"
- "47 pools using this hook"

Side counter: TIME ELAPSED: 2 minutes

Include placeholder: "[DEMO VIDEO: Browse Hooks Flow]"

Dark theme, card-based layout, green for audit badges.
Animate: search → results appear → highlight best match.
```

---

### Scene 4: Purchase & Deploy
**Duration**: 15-20 seconds

**Visual**: Purchase flow and instant deployment

**Content**:
```
[Purchase Flow]

SELECTED: Dynamic Fee Hook v2.1
Price: $299

┌─────────────────────────────────────────────┐
│ Purchase Summary                            │
│                                             │
│ Hook Price:           $299                  │
│ Integration Cost:     ~$200                 │
│ ─────────────────────────────               │
│ Total:                $499                  │
│                                             │
│ Compare to Self-Build: $28,000              │
│ YOU SAVE: $27,501 (98%)                     │
│                                             │
│ [Confirm Purchase]                          │
└─────────────────────────────────────────────┘

[Transaction confirmed ✓]
[Hook deployed to sDeFiSuperStars LBP Pool ✓]

TIME ELAPSED: 5 minutes
```

**Key Formula Display**:
```
C_purchase = $499
C_self = $28,000

C_purchase << C_self ✓
```

**Gamma Prompt**:
```
Create a slide showing hook purchase and deployment.

Left side: Purchase summary card:
- "Dynamic Fee Hook v2.1"
- Hook Price: $299
- Integration Cost: ~$200
- Total: $499

Right side: Dramatic comparison:
- "Self-Build Cost: $28,000" (crossed out, red)
- "Hook Bazaar: $499" (green, highlighted)
- "YOU SAVE: $27,501 (98%)" (large, glowing)

Show formula:
C_purchase($499) << C_self($28,000) ✓

Bottom sequence:
- "Transaction confirmed ✓"
- "Hook deployed to Pool X ✓"

TIME ELAPSED: 5 minutes

Dark theme, green for savings, red strikethrough for self-build cost.
Animate: show costs → reveal comparison → confirm transaction.
```

---

### Scene 5: Instant Integration
**Duration**: 10-15 seconds

**Visual**: Hook successfully integrated (same diagram as Problem story)

**Content**:
```
[Pool diagram with hook integrated - INSTANTLY]

        ┌──────────────────────────────┐
        │  sDeFiSuperStars LBP Pool    │
        │       ┌───────┐              │
        │       │ HOOK  │ ✓            │
        │       └───────┘              │
        └──────────────────────────────┘

DEPLOYMENT COMPLETE!

Cost: $499
Time: 5 minutes
Risk: Minimal (pre-audited)
```

**Gamma Prompt**:
```
Create a slide showing instant hook integration.

Center: Same pool diagram as problem story:
- Rectangle labeled "sDeFiSuperStars LBP Pool"
- Hook rectangle inside with checkmark
- But this time with celebration effect (confetti, glow)

Stats overlay (contrasting with problem story):
- "Cost: $499" (vs $28,000)
- "Time: 5 minutes" (vs 6 weeks)
- "Risk: Minimal" (pre-audited)

Big text: "DEPLOYMENT COMPLETE!"

Dark theme, celebratory green, slight confetti animation.
Animate: Pool appears → Hook slides in fast → Stats pop up.
```

---

### Scene 6: The Comparison Reveal
**Duration**: 15-20 seconds

**Visual**: Side-by-side comparison of both paths

**Content**:
```
┌─────────────────────┬─────────────────────┐
│    SELF-BUILD       │    HOOK BAZAAR      │
├─────────────────────┼─────────────────────┤
│                     │                     │
│   💰 $28,000        │   💰 $499           │
│                     │                     │
│   ⏱️ 6 weeks        │   ⏱️ 5 minutes      │
│                     │                     │
│   ⚠️ 5-15% risk     │   ✅ Pre-audited    │
│                     │                     │
│   😰 Stressful      │   😊 Simple         │
│                     │                     │
└─────────────────────┴─────────────────────┘

SAVINGS:
💰 $27,501 saved (98% reduction)
⏱️ 6 weeks saved
✅ Risk eliminated
```

**Gamma Prompt**:
```
Create a dramatic side-by-side comparison slide.

Two columns:

SELF-BUILD (left, red tint):
- Cost: $28,000
- Time: 6 weeks
- Risk: 5-15% vulnerability
- Experience: Stressful

HOOK BAZAAR (right, green tint):
- Cost: $499
- Time: 5 minutes
- Risk: Pre-audited ✓
- Experience: Simple

Below the comparison, reveal savings:
- "💰 $27,501 saved (98%)"
- "⏱️ 6 weeks saved"
- "✅ Risk eliminated"

Dark theme, clear visual contrast between left (bad) and right (good).
Animate: Left column appears first → Right column appears → Savings reveal dramatically.
```

---

### Scene 7: Call to Action
**Duration**: 10 seconds

**Visual**: Hook Bazaar branding with CTA

**Content**:
```
┌─────────────────────────────────────────────┐
│                                             │
│         🪝 HOOK BAZAAR                      │
│                                             │
│    "From $170k to $2k"                      │
│    "From months to minutes"                 │
│                                             │
│    [Browse Hooks] [Register Protocol]       │
│                                             │
│         hookbazaar.xyz                      │
│                                             │
└─────────────────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a closing call-to-action slide.

Center: Hook Bazaar logo (large)

Taglines:
- "From $170k to $2k"
- "From months to minutes"

Two CTA buttons:
- "Browse Hooks"
- "Register Protocol"

URL: hookbazaar.xyz

Dark theme, Hook Bazaar brand colors, professional.
Animate: Logo appears → Taglines fade in → Buttons pulse.
```

---

## Animation Timing Summary

| Scene | Duration | Cumulative |
|-------|----------|------------|
| 1. Decision (Hook Bazaar) | 12s | 12s |
| 2. Register Protocol | 12s | 24s |
| 3. Browse Marketplace | 18s | 42s |
| 4. Purchase & Deploy | 18s | 60s |
| 5. Instant Integration | 12s | 72s |
| 6. Comparison Reveal | 18s | 90s |
| 7. CTA | 10s | **100s** |

**Total runtime**: ~1:40

---

## Demo Video Integration Points

### Video 1: Registration Flow
**Location**: Scene 2
**Content**:
- Wallet connection
- Protocol registration form
- Success confirmation
**Duration**: 15-30 seconds
**Format**: Loom embed or MP4

### Video 2: Browse Hooks Flow
**Location**: Scene 3
**Content**:
- Search and filter hooks
- View hook details
- See audit reports
- Compare options
**Duration**: 30-45 seconds
**Format**: Loom embed or MP4

### Video 3: Purchase Flow (Optional)
**Location**: Scene 4
**Content**:
- Select hook
- Confirm purchase transaction
- Deploy to pool
**Duration**: 20-30 seconds
**Format**: Loom embed or MP4

---

## Key Formula Animations

### Scene 4: Cost Comparison
```
Show this formula building up:

C_purchase(P_HaaS) < C_self

Expand to:

($299 + $200) < ($10,000 + $3,000 + $15,000)
    $499     <         $28,000

✓ 98% savings
```

**Gamma Prompt for Formula**:
```
Animate the cost comparison formula:

Step 1: Show "C_purchase < C_self"
Step 2: Expand to "($299 + $200) < ($10,000 + $3,000 + $15,000)"
Step 3: Simplify to "$499 < $28,000"
Step 4: Big checkmark with "98% SAVINGS"

Use monospace font for formulas, green for Hook Bazaar side, red for self-build.
```

---

## Visual Style (Black & White + Colored Edges)

**Colors aligned with Hook Bazaar Design System (from frontend.md)**

| Element | Specification |
|---------|---------------|
| Background | Pure white (#FFFFFF) |
| All elements | Black (#000000) |
| Hook Bazaar/Savings edges | Gold outline (#FFD700) - primary brand |
| Self-build/Cost edges | Orange-Red outline (#E85A4F) - from logo |
| Time edges | Deep Blue outline (#003366) - from logo |

**Key Rule**: Everything is BLACK on WHITE. Color appears ONLY as edge highlights, outlines, or underlines - never as fills.

**Logo-Inspired Palette Reference**:
```
Gold (Primary):      #FFD700 - Hook Bazaar, success, savings
Orange-Red (Accent): #E85A4F - Self-build costs, warnings
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
  - Orange-Red (#E85A4F) edges for self-build costs (crossed out)
  - Deep Blue (#003366) edges for time elements
  - Gold (#FFD700) edges for Hook Bazaar success/savings
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
  - Orange-Red edge (#E85A4F) - self-build costs (to cross out)
  - Deep Blue edge (#003366) - time elements
  - Gold edge (#FFD700) - Hook Bazaar, savings, success

Rule: Elements are BLACK with COLORED OUTLINES/EDGES only
No filled colors - only edge highlights
```

**Edge Color Application (Logo-Aligned)**:
| Element Type | Fill | Edge/Outline |
|--------------|------|--------------|
| Self-build costs | Black text | Orange-Red (#E85A4F) outline + strikethrough |
| Hook Bazaar costs | Black text | Gold (#FFD700) outline |
| Time counters | Black text | Deep Blue (#003366) outline |
| Checkmarks | Black | Gold (#FFD700) edge |
| X marks (crossing out) | Black | Orange-Red (#E85A4F) edge |
| Savings numbers | Black text | Gold (#FFD700) outline (circled) |

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
| Circling | Emphasizing key points (savings!) |
| Underlining | Highlighting important text |
| Arrows | Connecting concepts |
| Checkmarks | Completing steps (fast!) |
| X marks | Crossing out self-build costs |

---

## Updated Scene Prompts (Whiteboard Style)

### Scene 1: Same Decision, Different Path (Whiteboard)
```
Create a whiteboard-style slide showing the same team meeting.

SLIDE TITLE: "Meet DeFiSuperStars" (ONLY this slide has a title)

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Same 3-4 stick figures from Problem story (O head, | body, lines for limbs)
- Speech bubbles being written:
  "Launching sDeFiSuperStars LBP pool!"
- Lightbulb icon drawn above one character
- Hook Bazaar logo sketched in (simple)

Animation: Dialogue written as if by hand
Colors: Black lines, green for "Hook Bazaar"
Mood shifts from uncertain to hopeful

NOTE: All other slides have NO title - only this first slide.
```

### Scene 2: Register Protocol (Whiteboard)
> This slide has the create_protocol demo video
### Scene 3: Browse Marketplace (Whiteboard)
> This slidee has the browse_hook demo video

### Scene 4: Purchase & Deploy (Whiteboard)
```
Create a whiteboard-style purchase comparison scene.

Style: Split-screen sketch
LEFT SIDE (crossed out in red):
- Write "Self-Build"
- Draw: "$28,000" (large)
- Draw big X through it

RIGHT SIDE (highlighted in green):
- Write "Hook Bazaar"
- Draw: "$499" (large, circled)
- Draw checkmark

BOTTOM:
- Hand writes formula: "$499 << $28,000"
- Circles "98% SAVINGS" multiple times in green
- Time: "5 minutes total"

Animation: Left drawn first, then X through it
Right side drawn with enthusiasm
Savings circled emphatically
```

### Scene 5: Instant Integration (Whiteboard)
```
Create a whiteboard-style success scene.

Style: Simple, celebratory sketch
- Draw pool rectangle labeled "sDeFiSuperStars Pool"
- Draw hook box inside (quickly!)
- Add big green checkmark
- Draw simple celebration marks (lines radiating out)
- Stats written quickly:
  "$499 ✓" (green)
  "5 min ✓" (blue)
  "Pre-audited ✓" (green)

Animation: Pool drawn, hook "pops" in fast
Checkmarks drawn with enthusiasm
Contrast with slow, painful Problem story
```

### Scene 6: Comparison Reveal (Whiteboard)
```
Create a whiteboard-style side-by-side comparison.

Style: Two columns drawn and compared

LEFT COLUMN (red):
- Header: "Self-Build" (underlined)
- "$28,000" with sad face
- "6 weeks" with clock
- "5-15% risk" (underlined twice)
- Draw X through entire column

RIGHT COLUMN (green):
- Header: "Hook Bazaar" (underlined, circled)
- "$499" with happy face
- "5 minutes" with checkmark
- "Pre-audited" with shield icon

BOTTOM:
- Draw arrow from left to right
- Write: "SAVE $27,501" (large, circled)
- Write: "SAVE 6 WEEKS" (underlined)

Animation: Left column first (grimace)
Then right column (relief)
Then dramatic savings reveal
```

### Scene 7: Call to Action (Whiteboard)
```
Create a whiteboard-style closing CTA.

Style: Clean, simple finish
- Draw Hook Bazaar logo (simple hook icon)
- Write taglines as if by hand:
  "From $170k to $2k"
  "From months to minutes"
- Draw two buttons (rectangles):
  [Browse Hooks]
  [Register]
- Write URL: hookbazaar.xyz (underlined)

Animation: Logo drawn first
Taglines written smoothly
URL underlined at the end
```

---

## Contrast Points with Problem Story

| Aspect | Problem Story | Solution Story |
|--------|---------------|----------------|
| Opening mood | Optimistic → Stressed | Curious → Relieved |
| Counter direction | Costs climbing | Costs minimal |
| Time feeling | Weeks dragging | Minutes flying |
| Ending | "Was it worth it?" | "This is the way" |
| Color progression | Green → Red | Neutral → Green |

---

## Gamma Tips for This Story

1. **Reuse assets** from Problem story (same stick figures, pool diagram)
2. **Embed Loom videos** directly in Gamma slides for demos
3. **Use "Compare" layout** for Scene 6 side-by-side
4. **Number animations** - Gamma highlights numbers well, use for cost reveals
5. **Link both presentations** - Problem → Solution as a sequence

---

## Scene-to-Slide Transition Guide

**CRITICAL**: Each scene = ONE slide. To enforce scene transitions as slide transitions in Gamma:

### Structuring for Transitions

| Scene | Slide # | Transition Type | Gamma Instruction |
|-------|---------|-----------------|-------------------|
| 1. Decision | 1 | Fade In | "Fade in from previous story or black" |
| 2. Register | 2 | Wipe Left | "Quick wipe - fast action" |
| 3. Browse | 3 | Push Up | "Push up - scrolling through options" |
| 4. Purchase | 4 | Morph | "Morph - selection to purchase" |
| 5. Integration | 5 | Zoom In | "Zoom into the deployed pool" |
| 6. Comparison | 6 | Split | "Split screen comparison reveal" |
| 7. CTA | 7 | Dissolve | "Dissolve to final CTA" |

### Gamma Prompt for Transitions

When prompting Gamma, explicitly state:
```
Create a presentation with 7 SLIDES (one per scene).
Each slide should have a distinct transition to the next:

Slide 1 → 2: Wipe left (quick action)
Slide 2 → 3: Push up (browsing feel)
Slide 3 → 4: Morph (selection process)
Slide 4 → 5: Zoom in (focus on success)
Slide 5 → 6: Split (comparison reveal)
Slide 6 → 7: Dissolve (to CTA)

Do NOT combine scenes into single slides.
Each scene is a separate slide with its own transition.
Transitions should feel FAST and SMOOTH - contrast with slow Problem story.
```

### Manual Transition Setup in Gamma

If Gamma doesn't auto-apply transitions:

1. **Click on slide** in the left panel
2. **Click "Transition"** button (or find in slide settings)
3. **Select transition type** for each slide:
   - **Fade**: For opening/closing slides
   - **Wipe**: For quick actions (fast!)
   - **Push**: For scrolling/browsing feel
   - **Morph**: For element transformations
   - **Zoom**: For focus moments
   - **Split**: For comparisons
   - **Dissolve**: For soft endings

4. **Set duration**: 0.5-1 seconds (FASTER than Problem story!)
5. **Preview**: Watch full presentation to verify timing

### Transition Timing per Scene

| Scene | Content Duration | Transition Duration | Total |
|-------|------------------|---------------------|-------|
| 1 | 10s | 1.5s fade in | 11.5s |
| 2 | 10s | 1s wipe | 11s |
| 3 | 16s | 1s push | 17s |
| 4 | 16s | 1s morph | 17s |
| 5 | 10s | 1s zoom | 11s |
| 6 | 16s | 1.5s split | 17.5s |
| 7 | 8s | 1s dissolve | 9s |
| **Total** | **86s** | **8s** | **94s** |

**NOTE**: Transitions are intentionally FASTER than Problem story to convey speed/efficiency.

### Alternative: Gamma "Story Mode"

For more control, use Gamma's Story Mode:
1. Create presentation in Story Mode (not deck mode)
2. Each "card" becomes a scene
3. Transitions are more fluid in Story Mode
4. Better for narrative/animation-heavy content
5. Can link to Problem story as a "chapter"

---

## Combined Presentation Flow

For maximum impact, present both stories together:

```
PROBLEM STORY (1:40)
├── Scene 1: Decision to build
├── Scene 2: Building ($10k)
├── Scene 3: Testing ($3k)
├── Scene 4: Audit ($15k)
├── Scene 5: Total reveal ($28k)
└── Scene 6: "Was it worth it?"

[TRANSITION: "There's a better way..."]

SOLUTION STORY (1:40)
├── Scene 1: Decision to use Hook Bazaar
├── Scene 2: Register (30 sec)
├── Scene 3: Browse hooks (2 min)
├── Scene 4: Purchase ($499)
├── Scene 5: Instant integration (5 min)
├── Scene 6: Comparison reveal
└── Scene 7: CTA

TOTAL: ~3:30
```

---

## Files Referenced

- [Protocol_Cost_Function.md](../problem-description/Protocol_Cost_Function.md) - Cost data and formulas
- [user_story_protocol.md (Problem)](../problem-description/user_story_protocol.md) - Problem story spec
- [Hooks.md](../problem-description/Hooks.md) - Integration details
