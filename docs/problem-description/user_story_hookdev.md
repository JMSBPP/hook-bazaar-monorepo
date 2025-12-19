# Hook Developer User Story: The Distribution Challenge (Gamma Spec)

## Overview

**Story**: A skilled smart contract developer builds a valuable Uniswap V4 hook, but struggles to find protocols willing to use it, monetize their work, and establish trust in a fragmented market.

**Tool**: Gamma Pro
**Duration**: ~90 seconds (6 scenes)
**Tone**: Frustrated, hopeful talent facing systemic barriers
**Source**: Hook developer economics and market fragmentation

**IMPORTANT - Slide Titles**: Only Slide 1 has a title: **"Meet @eth1000xSuperDev"**. All other slides have NO title.

---

## Hook Developer Economics

### Investment vs. Return Challenge
| Aspect | Reality |
|--------|---------|
| Development cost | $5k-$20k+ (self-funded) |
| Audit cost | $10k-$50k (if they want credibility) |
| Marketing | $0-$5k (usually $0, developers hate marketing) |
| Revenue | $0 until someone uses it |
| Discovery | Near impossible without connections |

### Market Fragmentation Problem
| Channel | Success Rate | Problem |
|---------|--------------|---------|
| Twitter/Discord | ~1% | Noise, no trust signal |
| Direct outreach | ~0.5% | "Who are you?" |
| Hackathon wins | ~5% | One-time visibility |
| Word of mouth | ~10% | Requires existing network |
| **Marketplace** | **N/A** | **Doesn't exist yet** |

---

## Scene Breakdown

### Scene 1: The Hook Developer
**Duration**: 10-15 seconds

**Slide Title**: "Meet @eth1000xSuperDev" (ONLY slide with a title)

**Visual**: Solo developer at home setup, coding

**Content**:
```
[Developer at desk with multiple monitors]

@eth1000xSuperDev: "I've built an amazing anti-snipe hook
                    that protects LBP launches from bots."

[Shows code on screen]

@eth1000xSuperDev: "30% better protection than anything out there.
                    Now I just need to find protocols who need it..."

[Scratches head, looks at empty inbox]
```

**Elements**:
- Single stick figure at developer setup
- Code editor on screen showing hook code
- Speech bubbles with dialogue
- Hook icon with sparkle (indicating quality)
- Empty notification/inbox icon

**Gamma Prompt**:
```
Create a slide showing a solo hook developer.

SLIDE TITLE: "Meet @eth1000xSuperDev" (this is the ONLY slide with a title)

Scene: Home office with single stick figure at computer.

Dialogue (as speech bubbles):
- "I built an amazing anti-snipe hook!"
- "30% better protection than anything out there"
- "Now I just need to find protocols..."

Show code on screen (scribbled lines representing code).
Show a hook icon with sparkle/star indicating quality.
Show empty inbox/notification icon.

Mood: Proud but uncertain.

Use simple stick figure (circle head, line body).
Animate dialogue appearing sequentially.

NOTE: No other slides should have titles - only this first slide.
```

---

### Scene 2: The Outreach Struggle
**Duration**: 20-25 seconds

**Visual**: Developer trying multiple outreach channels, all failing.

**Animation Flow**:
```
[Developer at computer, trying different channels]

CHANNEL 1: Twitter
- Posts about hook
- [tumbleweeds animation]
- "0 retweets, 2 likes"

CHANNEL 2: Discord
- Joins 10 protocol servers
- Posts in #general
- "Message deleted: No self-promotion"

CHANNEL 3: Cold Email
- "Hi, I built a hook..."
- [No response icons pile up]
- "Seen" but no reply

TIME COUNTER (right side):
Week 1 → Week 2 → Week 3 → Week 4

REJECTION COUNTER:
0 → 5 → 15 → 30+ protocols contacted
0 responses
```

**Final State**:
```
┌─────────────────────────────────┐
│ [Frustrated developer]          │
│                                 │
│  Twitter: 0 engagement          │
│  Discord: Banned from 3 servers │
│  Emails: 0/30 responses         │
│                        Week 4   │
│                        ████████ │
│  "Maybe I'm doing this wrong?"  │
└─────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a slide showing failed outreach attempts.

Left side: Stick figure at computer looking increasingly frustrated.
Show three channel attempts:

1. Twitter: Post icon → tumbleweeds → "0 engagement"
2. Discord: Chat icon → X mark → "Banned: no self-promo"
3. Email: Letter icon → pile of "no reply" icons

Right side: Two counters:
1. TIME: Week 1 → Week 4
2. REJECTIONS: "30+ protocols contacted, 0 responses"

End with speech bubble: "Maybe I'm doing this wrong?"

Black and white, use red edge for rejections, blue edge for time.
Draw elements appearing one by one showing the struggle.
```

---

### Scene 3: The Trust Problem
**Duration**: 15-20 seconds

**Visual**: Protocol team questioning the unknown developer.

**Animation Flow**:
```
[Split view: Developer on left, Protocol team on right]

DEVELOPER:
"My hook is audited and battle-tested!"

PROTOCOL TEAM:
"Who audited it?"
"Never heard of them."
"How do we know it's secure?"
"Do you have references?"

[Trust meter shows: 0%]

COMPARISON:
Unknown developer ❌
  vs
Big auditing firm ✓ (but $50k+)
```

**Final State**:
```
┌─────────────────────────────────┐
│ [Dev]          [Protocol team]  │
│  😊      ←?→      😐😐😐        │
│                                 │
│  "It's secure!"   "Prove it."   │
│                                 │
│  TRUST BARRIER: ████████████    │
│  Without reputation: ❌          │
│  Audit from top firm: $50k+     │
└─────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a slide showing the trust barrier.

Split view:
- Left: Stick figure developer saying "It's secure!"
- Right: 3 stick figures (protocol team) looking skeptical

Show dialogue exchange:
Developer: "My hook is audited!"
Team: "Who audited it?" "Never heard of them"

Show a TRUST METER at 0% or very low.

Add comparison:
- "Unknown developer: ❌"
- "Top audit firm: $50k+"

Black and white, red edge around trust barrier.
Draw skeptical expressions through posture (arms crossed, question marks).
```

---

### Scene 4: The Monetization Maze
**Duration**: 15-20 seconds

**Visual**: Developer trying to figure out pricing and payment.

**Animation Flow**:
```
[Developer with thought bubbles showing pricing confusion]

PRICING DILEMMA:
"Free? Then why did I spend months building this?"
"$1000 flat? Too cheap for complex hooks"
"Per-transaction? How do I enforce it?"
"Revenue share? No infrastructure for that"

PAYMENT PROBLEM:
- No standard payment rails
- No smart contract for licensing
- Trust issue: "Pay now, deliver later?"
- Can't prove usage for rev-share

COMPETITOR CHECK:
"I could open-source it and hope for tips...
 but that's not sustainable."
```

**Final State**:
```
┌─────────────────────────────────┐
│ [Developer with $ question marks]│
│                                 │
│  💰 Free tier? = no income       │
│  💰 Flat fee? = trust needed     │
│  💰 Per-tx? = no enforcement     │
│  💰 Rev-share? = no infrastructure│
│                                 │
│  "How do I even get paid?"      │
└─────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a slide showing monetization confusion.

Center: Stick figure surrounded by dollar signs and question marks.

Show four pricing options, each crossed out:
1. "Free tier" → "= no income" (red X)
2. "Flat fee" → "= trust needed" (red X)
3. "Per-transaction" → "= no enforcement" (red X)
4. "Revenue share" → "= no infrastructure" (red X)

Speech bubble at bottom: "How do I even get paid?"

Black and white, red edges for problems/X marks.
Draw question marks appearing around developer's head.
Show each option appearing then getting crossed out.
```

---

### Scene 5: The Investment Reality
**Duration**: 15-20 seconds

**Visual**: Cost breakdown showing developer's self-investment with zero return.

**Animation Flow**:
```
[Cost bars building up with no revenue counter]

DEVELOPER'S COSTS:
Development time: 200 hours × $50/hr = $10,000 (opportunity cost)
Personal audit:   $15,000 (to gain ANY credibility)
Marketing:        $500 (ads, didn't work)
─────────────────────────────────
Total invested:   $25,500

REVENUE TO DATE:
$0

ROI CALCULATOR:
-$25,500 / 6 months = still waiting...

[Sad face on developer]
"I'm subsidizing the ecosystem with my time"
```

**Final State**:
```
┌─────────────────────────────────┐
│ @eth1000xSuperDev's LEDGER      │
│                                 │
│  Dev time:    $10,000 (200 hrs) │
│  Audit:       $15,000           │
│  Marketing:   $500              │
│  ───────────────────            │
│  TOTAL:       $25,500           │
│                                 │
│  REVENUE:     $0                │
│  TIME:        6 months          │
│                                 │
│  "Subsidizing DeFi with my time"│
└─────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a cost vs. revenue slide for the developer.

Show a ledger-style breakdown:
- "Dev time: $10,000 (200 hrs)"
- "Audit: $15,000"
- "Marketing: $500"
- Line underneath
- "TOTAL: $25,500" (red, circled)

Separate section:
- "REVENUE: $0" (large, red, emphasized)
- "TIME: 6 months" (blue)

End with speech bubble: "Subsidizing DeFi with my time"

Black and white, red edge for costs/losses, blue for time.
Draw cost items appearing one by one, stacking.
Circle the zero revenue dramatically.
```

---

### Scene 6: The Fragmented Market
**Duration**: 15-20 seconds

**Visual**: Summary showing the broken market with no marketplace connecting hooks to protocols.

**Animation Flow**:
```
[Map showing disconnected entities]

LEFT SIDE: Hook Developers
- 100s of talented developers
- Building valuable hooks
- Can't find protocols
- "We build, but can't sell"

RIGHT SIDE: Protocols
- 1000s of protocols
- Need specialized hooks
- Can't find developers
- "We need, but can't find"

CENTER: Gap / Missing piece
- No discovery
- No trust system
- No payment rails
- No standards

"The market exists... but it's invisible."
```

**Final State**:
```
┌─────────────────────────────────────────┐
│                                         │
│  DEVELOPERS          ❓          PROTOCOLS│
│    👤👤👤      [NO BRIDGE]      👤👤👤   │
│    👤👤👤                        👤👤👤   │
│                                         │
│  ✓ Build hooks      ✓ Need hooks       │
│  ✗ Can't reach      ✗ Can't find       │
│  ✗ Can't monetize   ✗ Can't trust      │
│                                         │
│  "We're both here... but invisible"     │
└─────────────────────────────────────────┘
```

**Gamma Prompt**:
```
Create a summary slide showing market fragmentation.

Split the slide in three parts:

LEFT: Group of stick figures labeled "Hook Developers"
- Show 6-9 small stick figures
- Checkmark: "Build hooks"
- Red X: "Can't reach protocols"
- Red X: "Can't monetize"

CENTER: Big question mark or gap
- Label: "NO BRIDGE"
- "No discovery"
- "No trust"
- "No payment"

RIGHT: Group of stick figures labeled "Protocols"
- Show 6-9 small stick figures
- Checkmark: "Need hooks"
- Red X: "Can't find developers"
- Red X: "Can't verify quality"

Bottom: "We're both here... but invisible to each other"

Black and white, red edges for X marks, gold edge for checkmarks.
Draw the two groups, then show the gap between them.
End with the question: "Who will bridge this gap?"
```

---

## Animation Timing Summary

| Scene | Duration | Cumulative |
|-------|----------|------------|
| 1. The Hook Developer | 12s | 12s |
| 2. Outreach Struggle | 22s | 34s |
| 3. Trust Problem | 18s | 52s |
| 4. Monetization Maze | 18s | 70s |
| 5. Investment Reality | 18s | 88s |
| 6. Fragmented Market | 15s | **103s** |

**Total runtime**: ~1:43

---

## Visual Style (Black & White + Colored Edges)

**Colors aligned with Hook Bazaar Design System (from frontend.md)**

| Element | Specification |
|---------|---------------|
| Background | Pure white (#FFFFFF) |
| All elements | Black (#000000) |
| Cost/Warning/Rejection edges | Orange-Red outline (#E85A4F) - from logo |
| Time edges | Deep Blue outline (#003366) - from logo |
| Success edges | Gold outline (#FFD700) - primary brand color |

**Key Rule**: Everything is BLACK on WHITE. Color appears ONLY as edge highlights, outlines, or underlines - never as fills.

**Logo-Inspired Palette Reference**:
```
Gold (Primary):      #FFD700 - Success, checkmarks, positive
Orange-Red (Accent): #E85A4F - Costs, warnings, problems, rejections
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
  - Orange-Red (#E85A4F) edges for costs, rejections, and warnings
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
  - Orange-Red edge (#E85A4F) - costs, warnings, rejections, problems
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
| Warning/Rejection items | Black | Orange-Red (#E85A4F) edge |
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
| X marks | Showing problems/rejections |

---

## Updated Scene Prompts (Whiteboard Style)

### Scene 1: The Hook Developer (Whiteboard)
```
Create a whiteboard-style slide showing a solo developer.

SLIDE TITLE: "Meet @eth1000xSuperDev" (ONLY this slide has a title)

Style: Hand-drawn sketch, marker on white background
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Draw single stick figure at desk with computer
- Speech bubbles appear as if being written
- "I built an amazing anti-snipe hook!" underlined in gold
- Hook icon drawn with wobbling lines, sparkle beside it
- Empty inbox icon with red X

Animation: Elements drawn one-by-one, 2-3 seconds each
Colors: Black lines, gold accent for hook quality
Keep it minimal and friendly

NOTE: All other slides have NO title - only this first slide.
```

### Scene 2: Outreach Struggle (Whiteboard)
```
Create a whiteboard-style slide showing failed outreach.

Style: Hand-drawn, progressive revelation
ALL CHARACTERS ARE STICK FIGURES (circle head, line body, line limbs)
- Draw stick figure at desk first (simple: O for head, | for body, lines for arms)
- Three channel boxes appearing and getting X marks:
  - Twitter icon → tumbleweeds → "0 engagement" (red X)
  - Discord icon → ban hammer → "Banned" (red X)
  - Email icon → pile up → "0/30 responses" (red X)
- Time counter in BLUE: "Week 1" → "Week 4"

Draw each element step-by-step
Circle all the X marks with red marker
End with speech bubble: "Maybe I'm doing this wrong?"
```

### Scene 3: Trust Problem (Whiteboard)
```
Create a whiteboard-style trust barrier scene.

Style: Sketch on white background
- Split view: Developer on left, Protocol team on right
- Draw single stick figure (developer) with speech bubble
- Draw 3 stick figures (protocol team) with question marks above heads
- Trust meter drawn as empty bar (0%)
- Dialogue exchange written as if by hand:
  "It's secure!" vs "Prove it."
- Comparison box: "Unknown dev: ❌" vs "Top audit: $50k+"

Hand draws question marks around protocol team
Circle "TRUST BARRIER" in red
```

### Scene 4: Monetization Maze (Whiteboard)
```
Create a whiteboard-style monetization confusion scene.

Style: Hand-drawn with emphasis on confusion
- Draw stick figure in center surrounded by $ and ? marks
- Four pricing options written and crossed out:
  "Free?" → "= no income" (red X)
  "Flat fee?" → "= trust needed" (red X)
  "Per-tx?" → "= no enforcement" (red X)
  "Rev-share?" → "= no infrastructure" (red X)
- Question marks drawn floating around head

Draw each option appearing then getting crossed out
Big speech bubble: "How do I even get paid?"
```

### Scene 5: Investment Reality (Whiteboard)
```
Create a dramatic whiteboard cost summary.

Style: Hand-drawn ledger/accounting style
- Draw three cost items being sketched:
  Dev time:   $10,000 (200 hrs)
  Audit:      $15,000
  Marketing:  $500
- Hand draws a line underneath
- Writes total: "$25,500" (red, circled)
- Separate box: "REVENUE: $0" (large, red, double-circled)
- Writes "6 MONTHS" (blue, underlined)

Progressive: items drawn top-to-bottom
Final $0 revenue circled emphatically with wobbling red line
Speech bubble: "Subsidizing DeFi with my time"
```

### Scene 6: Fragmented Market (Whiteboard)
```
Create a whiteboard conclusion scene.

Style: Simple sketch showing the gap
- Draw group of stick figures on left labeled "DEVELOPERS"
  - Checkmark: "Build hooks" (gold)
  - X mark: "Can't reach" (red)
  - X mark: "Can't monetize" (red)
- Draw big gap in center with "NO BRIDGE" and "?"
- Draw group of stick figures on right labeled "PROTOCOLS"
  - Checkmark: "Need hooks" (gold)
  - X mark: "Can't find" (red)
  - X mark: "Can't trust" (red)
- Bottom: "We're both here... but invisible"

End with question: "Who will bridge this gap?" (circled)
Slight pause on the uncertainty
```

---

## Gamma Tips

1. **Use "Cards" layout** for the split scenes - allows side-by-side content
2. **Stick figure style** - all characters as simple stick figures (circle head, line body, line limbs)
3. **Smart animation** - Gamma auto-animates between similar layouts
4. **Embed counters** - Use Gamma's number highlight feature for rejection counts
5. **Export to video** for the smoothest playback

---

## Scene-to-Slide Transition Guide

**CRITICAL**: Each scene = ONE slide. To enforce scene transitions as slide transitions in Gamma:

### Structuring for Transitions

| Scene | Slide # | Transition Type | Gamma Instruction |
|-------|---------|-----------------|-------------------|
| 1. Hook Developer | 1 | Fade In | First slide, fade from black |
| 2. Outreach Struggle | 2 | Wipe Left | "Continue with left wipe showing journey" |
| 3. Trust Problem | 3 | Split | "Split view showing two sides" |
| 4. Monetization Maze | 4 | Morph | "Morph from previous frustration" |
| 5. Investment Reality | 5 | Zoom In | "Zoom into the financial reality" |
| 6. Fragmented Market | 6 | Dissolve | "Dissolve to show the big picture" |

### Gamma Prompt for Transitions

```
Create a presentation with 6 SLIDES (one per scene).
Each slide should have a distinct transition to the next:

Slide 1 → 2: Wipe left (starting the struggle)
Slide 2 → 3: Push right (confronting reality)
Slide 3 → 4: Morph (same developer, new frustration)
Slide 4 → 5: Zoom in (financial truth revealed)
Slide 5 → 6: Dissolve (seeing the big picture)

Do NOT combine scenes into single slides.
Each scene is a separate slide with its own transition.
```

### Transition Timing per Scene

| Scene | Content Duration | Transition Duration | Total |
|-------|------------------|---------------------|-------|
| 1 | 10s | 2s fade in | 12s |
| 2 | 20s | 2s wipe | 22s |
| 3 | 16s | 2s push | 18s |
| 4 | 16s | 1.5s morph | 17.5s |
| 5 | 16s | 2s zoom | 18s |
| 6 | 13s | 2s dissolve | 15s |
| **Total** | **91s** | **11.5s** | **102.5s** |

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

### Alternative: Gamma "Story Mode"

For more control, use Gamma's Story Mode:
1. Create presentation in Story Mode (not deck mode)
2. Each "card" becomes a scene
3. Transitions are more fluid in Story Mode
4. Better for narrative/animation-heavy content

---

## Key Differences from Protocol Story

| Aspect | Protocol Story | Hook Developer Story |
|--------|----------------|---------------------|
| Title Slide | "Meet DeFiSuperStars" | "Meet @eth1000xSuperDev" |
| Main character | Protocol team (3-4 people) | Solo developer (1 person) |
| Core problem | Building is expensive | Distribution is impossible |
| Cost focus | Dev + Test + Audit | Self-investment with $0 return |
| Emotional arc | Surprise at costs | Frustration at invisibility |
| Ending question | "Was it worth it?" | "Who will bridge this gap?" |

---

## Files Referenced

- Protocol_Cost_Function.md - Market cost data
- Hook developer economics research
