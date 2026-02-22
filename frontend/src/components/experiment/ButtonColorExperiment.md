# Button Color Change Experiment

**Experiment ID:** 8  
**Project ID:** 7  

## Segments

| Segment | ID | Description | Color |
|---------|----|-------------|-------|
| A (Control) | 15 | Original layout, no changes | Green |
| B (Variant) | 16 | Change from green to blue | Blue |

## Preview URLs

- Segment A: `?x=sO4nkBIl-oA`
- Segment B: `?x=mz8tIamVrOs`

## Usage

Replace the existing sign-in button with `<ButtonColorExperiment onSignIn={handleGoogleSignIn} />`.

Call `trackSignInSuccess(userId)` after a successful sign-in to fire the `signin_success` event.

## Tracked Events

- `signin_view` — fired on mount
- `signin_attempt` — fired on button click
- `signin_success` — fired after successful sign-in (call manually)
