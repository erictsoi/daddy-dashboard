# Prompt for Antigravity IDE (Minimax 2.5)

**Context:**
You are building a "Returning User" view for the "Daddy Dashboard" application. The goal is to create a highly interactive, playful, and polished card selection interface. The user is presented with a deck of profile cards that animate from a messy stack into an organized, infinite-loop carousel.

**Component:** `LandingPage.tsx`

**Data:**
- `RETURNING_PROFILES`: An array of 7 profile objects (Admin, Amara, Marcus, Sophia, Kai, Adrian, Rohan).
- `INITIAL_PROFILES`: A set of filler cards used for the initial stack effect.

**Animation Stages:**
The component manages three distinct animation stages using state (`animationStage`):
1.  **'stack'**: The initial state.
2.  **'dealing'**: Transition state where filler cards fly away.
3.  **'carousel'**: The final interactive state where users browse profiles.

**Detailed Behavior & Visuals:**

1.  **Starting State ('stack'):**
    -   All cards (both returning profiles and filler cards) start in a messy pile in the center of the screen.
    -   **Visuals:**
        -   `x`: Random offset between -8px and +8px.
        -   `y`: Random offset between -10px and +10px.
        -   `rotate`: Random rotation between -2 and +2 degrees.
        -   `zIndex`: Stacked based on index (higher index = lower z-index).
    -   This creates a realistic "untidy deck" look.

2.  **The "Deal" ('dealing'):**
    -   After 800ms, the stage shifts to 'dealing'.
    -   **Filler Cards:** These cards (from `INITIAL_PROFILES`) animate off-screen.
        -   `y`: Drops to 1000px (off-screen bottom).
        -   `x`: Flies randomly left or right (-500px to +500px).
        -   `rotate`: Spins wildly (-45 to +45 degrees).
        -   `opacity`: Fades to 0.
        -   `scale`: Shrinks to 0.5.
    -   **Returning Profiles:** Prepare to move into the carousel formation.

3.  **The Carousel ('carousel'):**
    -   After another 800ms (1600ms total), the 7 `RETURNING_PROFILES` fan out into an interactive, infinite-loop carousel.
    -   **Infinite Loop Logic:**
        -   The carousel behaves as a circular buffer.
        -   `offset` is calculated relative to the `activeIndex` (center card).
        -   Logic handles wrapping so the transition from the last card to the first is seamless.
        -   Only 5 cards are visible at a time (Center, +1 Left, +2 Left, +1 Right, +2 Right).
    -   **Card Positioning (The "Fan" Effect):**
        -   **Spacing (`xOffset`):** Cards overlap significantly with a 140px offset per index.
        -   **Arch (`yOffset`):** Side cards drop down to create an arch effect (`absOffset * 20`).
        -   **Scale:** Side cards shrink (`1 - absOffset * 0.1`).
        -   **Z-Index:** The center card is on top (`100`), with side cards layered behind (`100 - absOffset`).
        -   **Rotation:** Cards fan out slightly (`offset * 3` degrees).
    -   **"Messiness" (Organic Feel):**
        -   Even in the organized carousel, a slight random jitter is applied to `y` and `rotate` to prevent it from looking too robotic.
        -   `messyRotate`: `((index * 17) % 5) - 2`
        -   `messyY`: `((index * 23) % 10) - 5`

4.  **Active Card & Interaction:**
    -   **Active State:** The center card (`activeIndex`) is fully opaque, largest scale, and highest z-index.
    -   **Navigation:** Clicking a side card rotates the carousel to make that card active.
    -   **Header & Footer:**
        -   The "Who are we learning with Today?" header pill dynamically changes its background color to match the `color` property of the active profile.
        -   The "Select this profile" button also matches the active profile's color.
        -   The footer text updates to show a blurb about the active profile (Name, Year, Interests, Age).

5.  **End State ("Reading" Animation):**
    -   When the user clicks the *active* (center) card:
    -   **Selected Card:**
        -   `scale`: Zooms up to 1.5x.
        -   `x`, `y`: Centers perfectly on screen (0, 0).
        -   `zIndex`: Jumps to 1000 (on top of everything).
        -   `rotate`: Straightens to 0 degrees.
        -   `transition`: Uses a spring animation (`stiffness: 200`, `damping: 25`) for a snappy feel.
    -   **Other Cards:** Fade out (`opacity: 0`) and shrink (`scale: 0.8`).
    -   **UI Elements:** The Header and Footer fade out (`opacity: 0`, slide away) to focus entirely on the card.
    -   **Navigation:** After an 800ms delay (to let the animation play), the app navigates to `/admin/${profileId}`.

**Visual Style:**
-   **Background:** `#FFFBF5` with a subtle radial dot pattern (`#CBD5E1`).
-   **Typography:** Bold, playful fonts (Fredoka/Inter).
-   **Shadows:** Hard, solid shadows (e.g., `border-2 border-black`) for a "neo-brutalist" or "pop" aesthetic.
-   **Colors:** Vibrant, distinct colors for each profile.
