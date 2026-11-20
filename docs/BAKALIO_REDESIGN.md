# Bakalio redesign review — 2026-11-18

## Product and audience

The owner selected Bakalio for this iteration. The visible product brand, logo, favicon, SEO title and auth mail branding now use it. Internal repository/container/database identities stay stable so existing accounts and documents keep working. Name/domain/trademark availability has not been checked; this is a product naming choice, not a clearance result.

The primary audience is students writing a thesis, initially Czech-speaking. The promise is a manageable next step: sources, notes, chapters and versions in one workspace. A student should understand this before encountering infrastructure or AI terminology.

## Why the previous design missed the brief

The muted green research-desk palette, restrained type and formal copy made the product look administrative. A narrow two-column hero reduced the product preview and gave the main statement little presence. Repeated abstract language described a mood more often than a useful action. The interface worked, but did not have a memorable identity for its audience.

## Implemented direction

- A blue notebook cover around a real editor preview; one yellow note signals clarity. No stock portrait, invented school logo, testimonial or usage count.
- A large, centered sans-serif headline with a direct Czech promise: “Tvoje práce. Míň chaosu.” Manuscript text retains serif typography for long-form reading.
- Three interactive problem-to-action scenarios: finding a paper, keeping sources beside writing, and recovering an earlier version. Every scenario links to a usable sandbox.
- A real feedback invitation goes to the existing stored support form. These are product scenarios, not testimonials. Reviews should only be published after actual feedback and permission to attribute it.
- A Czech informal voice for the hero and main workflow. English and Chinese equivalents, translated teaching-material labels, persistent language/theme and an independently editable manuscript.
- Workspace navigation and selected states adopt the same blue identity. Demo sidebar selection now follows its query-string view.

## Design plan and critique

Palette: canvas #f5f7fc, white #ffffff, ink #182642, blue #2458db, note #f5d969, line #dce3f0. Dark canvas #10182a and surface #18243a, with pale blue #9bb9ff for accessible controls. System sans supports Czech and Chinese without external font downloads; Georgia/CJK serif stays inside manuscript content.

Layout: centered value proposition → wide live product preview → interactive student situations → three actual workflow steps → source/citation example → privacy control → beta terms → feedback → FAQ. Desktop scenarios use a vertical choice list beside a changing panel; mobile stacks the choices and panel. The preview uses an actual product component rather than a decorative screenshot.

Critique: a blue SaaS page alone would still be generic. The notebook-cover presentation, language tied to actual student problems, and functional scenario selector provide subject-specific meaning. The yellow note is the only decorative accent. No repeated animated reveals or decorative gradients were added.

## Other product findings and priorities

1. Real AI is still disabled. Do not let the new visual polish imply real generation or verified evidence. The beta section and editor retain explicit limitations.
2. Registration mail still goes to local Mailpit. Remote demo access is easy; remote self-service account verification needs proper outbound SMTP before public testing.
3. The sample manuscript is intentionally fictional English teaching material. The UI language does not rewrite it. A Czech teaching manuscript would make a useful additional onboarding example.
4. Human Czech proofreading is still needed for the entire account/error/legal flow. Main marketing copy was revised, but no native-editor approval is claimed.
5. Real quotes should be collected via the feedback form and separately approved for publication. No fabricated customer identity, rating, school or outcome is present.
6. Public release still needs operator details, legal review, name clearance and TLS. These do not block the private Tailscale preview.

## Validation

The first pass was rendered at 1440px Czech/light, 390px Chinese/light and 768px English/dark and visually reviewed. No horizontal overflow was observed. Follow-up improvements included headline spacing, translated teaching labels, Czech tone, feedback entry and selected demo navigation. Final matrix and interaction evidence are recorded in the current validation artifacts, not inherited from the old design's Lighthouse score.

Final checks: Wasp build, production Vite build, Docker API/web builds, TypeScript and Prettier passed; existing 5 unit tests passed. The 36-case screenshot matrix returned no overflow, page exceptions or sampled axe violations. The dedicated interaction script passed scenario keyboard/click selection, feedback navigation, demo selected states, preserved manuscript on language/theme changes, and mobile navigation. Additional final workspace screenshots cover all three widths in both themes. Source records and live accounts were preserved.

New-design Lighthouse 13.0.3 mobile simulation, local Chrome, `/cs`: performance 99/100, accessibility 100/100. This is a local lab measurement. Report: `artifacts/bakalio-lighthouse.json`.

## Superseding design increment — 2026-11-20

The implementation now uses self-hosted Manrope, an original geometric b/page symbol, warm paper and a split hero with an interactive thesis workflow. The former centered notebook-cover description above records the previous iteration. A four-step prepared example and generic template explorer now expose the proposal/blueprint/section/evidence journey directly. The reference site Amplefound informed product-led placement and a clear primary action, not copied assets, wording or code. See DESIGN_SYSTEM.md and the current screenshots for the actual implementation.
