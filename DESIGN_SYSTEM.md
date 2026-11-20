# Bakalio design system

A young academic studio: warm paper, strong cobalt, small annotation-yellow accents and a quiet manuscript. Two local /design-preview candidates explored a notebook composition and a dark console; the notebook direction was selected for reading comfort and a clearer adjacent product preview. The preview route is development-only.

Tokens live in app/src/studio/tokens.css. Light canvas #fafaf7, ink #182642, surface #fff, cobalt #2458db. Dark canvas #111b2b and surface #18243a use lighter text and interactive blue rather than simple inversion. Manrope variable is self-hosted under OFL for display headings; system UI fonts support Czech and Chinese; manuscript typography remains serif.

Marketing uses an asymmetric headline/product composition, interactive four-step thesis example and broad template exploration section. The demonstration is explicitly precomputed and stores edits only in React state. Workspace density is separate: proposal review, compact chapter rows, recoverable manuscripts, and evidence scope labels.

Styles are divided into tokens, base, responsive and marketing files. Shared controls retain keyboard focus; demo tabs support arrows/Home/End; motion respects reduced-motion preferences. Mobile keeps editor panels switchable and save state visible. Do not encode verification status solely in color.

Screenshots and browser validation are described in IMPLEMENTATION_STATUS.md. No invented testimonials, institutional endorsements or success metrics are permitted.
