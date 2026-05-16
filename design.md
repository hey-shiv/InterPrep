# Interview AI — Design System

## Identity
"The Reckoning Edition" — Linear/Vercel aesthetic. Dark, editorial, high-contrast.
Not a startup SaaS. An intelligence platform.

## Colors
```
bg0: #07070C   (deepest, page bg)
bg1: #0A0A0F
bg2: #111118
bg3: #16161E
bg4: #1C1C28

border:    #2A2A3A
borderSub: #1E1E2C

accent:      #6366F1  (indigo)
accentLight: #818CF8
accentDim:   #4338CA
accentGlow:  rgba(99,102,241,0.1)

phaseEntry:     #0EA5E9 (blue)
phaseInterview: #8B5CF6 (purple)
phaseReport:    #10B981 (emerald)

text1: #F1F1F5
text2: #9898B0
text3: #55556A
text4: #33334A

hire:       #22C55E
borderline: #F59E0B
noHire:     #EF4444
```

## Typography
- **Display**: DM Sans, 700, tight letter-spacing, large
- **Body**: DM Sans, 400/500
- **Mono**: DM Mono — for scores, metrics, labels, phase tags
- Fallback: system-ui

## Spacing & Layout
- Max content width: 1200px, centered
- Section padding: 96px vertical
- Cards: 1px border, bg2/bg3, 12-16px radius
- No box shadows — borders and backgrounds only

## Motion
- Page load: staggered fade + translateY(8px) → 0 via CSS
- Hover: opacity transitions 200ms
- No gratuitous animation

## Components
- **NavBar**: sticky top, bg0/90 backdrop blur, logo left, nav links center, CTA right
- **GlowButton**: accent bg, 0 border-radius rounding, subtle glow on hover
- **PhaseCard**: top-colored border, dark bg, mono phase label
- **ScoreRing**: SVG ring, mono score
- **VerdictBadge**: HIRE/BORDERLINE/NO_HIRE with color
