# Carousel Implementation Plan

## Overview
Implement LandingView carousel per carousel.md spec with 3-phase animation: stack → dealing → carousel

## Animation Stages

### Stage 1: 'stack' (Initial)
- All cards (returning profiles + filler cards) in messy pile
- Random x: -8px to +8px
- Random y: -10px to +10px
- Random rotate: -2° to +2°
- Z-index: stacked by index

### Stage 2: 'dealing' (After 800ms)
- Filler cards fly off-screen:
  - y: 1000px (off-screen)
  - x: -500px to +500px (random left/right)
  - rotate: -45° to +45°
  - opacity: 0
  - scale: 0.5
- Returning profiles prepare for carousel

### Stage 3: 'carousel' (After 1600ms total)
- 7 profiles fan out into infinite-loop carousel
- Only 5 visible: Center, +1 Left, +2 Left, +1 Right, +2 Right

## Carousel Specifications

### Positioning
- xOffset: 140px per index
- yOffset: absOffset * 20 (arch effect)
- Scale: 1 - absOffset * 0.1
- Z-index: 100 - absOffset
- Rotation: offset * 3 degrees

### Messiness (Organic Feel)
- messyRotate: ((index * 17) % 5) - 2
- messyY: ((index * 23) % 10) - 5

## Selected State
- Center card: scale 1.5x, z-index 1000, rotate 0°
- Other cards: opacity 0, scale 0.8
- Header/Footer: fade out
- Navigate after 800ms to `/admin/${profileId}`

## Implementation Tasks
- [ ] Add filler cards (INITIAL_PROFILES)
- [ ] Implement 3-phase state: 'stack' | 'dealing' | 'carousel'
- [ ] Stack phase: random offsets for all cards
- [ ] Dealing phase: animate filler cards off-screen
- [ ] Carousel phase: infinite loop, fan effect, messiness
- [ ] Active card highlight with dynamic colors
- [ ] Selected state with zoom and fade
- [ ] Dynamic header/footer colors based on active profile

## Data
- RETURNING_PROFILES: 7 profiles (Admin, Amara, Marcus, Sophia, Kai, Adrian, Rohan)
- INITIAL_PROFILES: filler cards for stack effect
