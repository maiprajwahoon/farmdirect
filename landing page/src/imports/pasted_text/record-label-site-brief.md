# Summary

A record-label landing page whose hero is a portal: two panels part outward to uncover a full-bleed image while the wordmark grows, its tracking tightens and its two halves travel to opposite edges. The catalogue below is a physical deck of sleeves you throw aside.

# Style

Near-black ground with a warm bone ink, one amber accent and one teal, both taken from the photography so the page and the image are the same palette. A wide geometric display face carries every heading; a neutral sans carries all small type at wide tracking.

## Spec

Apply a dark label style. Palette: ground #0A0C0E, secondary ground #101317, ink #EDE7DC, secondary ink #9EA5A8, muted #6C7378, amber #E8913C, teal #2E6B72, hairlines rgba(237,231,220,.13). Typography: 'Syne' 600-800 for the wordmark and headings at letter-spacing -.02em to -.03em; 'Sora' 400-600 at 10.5-16px, with labels uppercase at letter-spacing .12em-.15em. Pull the two accents OUT of the hero photograph so the interface and the image agree. MUST keep both accents to type, a dot or a rule, never a filled area. DO NOT use a gradient banner, a bento grid, a glow, or a drop shadow on anything except the deck cards.

# Layout & Structure

Six sections. A tall portal hero with a sticky stage, a full-height statement fold, a two-column releases section carrying a throwable deck, a hairline roster, a dates table, and a close whose wordmark is cropped by the page edge.

## Navigation

Fixed 58px bar on a translucent ground with a 14px backdrop blur and a bottom hairline. Display wordmark at 15px with a trailing period in the amber, uppercase links at 10.5px turning amber on hover, one pill button.

## Portal hero

A tall section, roughly two and a half viewports, containing a sticky full-height stage with overflow hidden and isolation isolate. Layer, back to front: a full-bleed image starting somewhat overscaled; a duotone wash blending the two accents at mix-blend-mode overlay and zero opacity; a radial veil darkening the edges; TWO solid panels each a little over half the width, pinned to the left and right edges so they meet in the middle and the hero begins CLOSED; two small glowing accent dots at the centre; and the wordmark on top, split into two spans. Corner metadata pins to the top and bottom edges.

## Statement fold

A full-height section holding a small uppercase label, a statement at clamp(24px,3.6vw,52px) over about 22ch with one phrase in the amber, an outlined index numeral using -webkit-text-stroke with a transparent fill, and a circular image floating off the right edge at reduced opacity that drifts and rotates on scroll.

## Releases

Two columns: a headline, a lede and two buttons on one side; the deck on the other, square, with a hint line and progress dots beneath it.

## Roster and dates

Hairline-ruled rows carrying a small uppercase accent label, a display-face name and a right-aligned count. Then a table with uppercase headers over a hairline, a display-face first column and neutral metadata columns, collapsing to a two-column grid per row on narrow screens.

## Close

A short headline, a fine-print line, two buttons at the opposite edge, a hairline footer strip, then the wordmark full width, translated down slightly so the page edge crops it.

# Special Components

## The portal title

The signature move: the wordmark grows while its tracking tightens and its halves separate.

Split the wordmark into two spans on one line. As scroll progresses through the hero, scale the whole title UP by a modest amount while SIMULTANEOUSLY tightening its letter-spacing, and translate the first span left and the last span right by roughly half their own width. Growing and tightening at the same time is the entire point: it reads as a title opening rather than a plain zoom, and doing one without the other loses the effect. Pick the exact amounts against your own typeface — a wide geometric face needs less tightening than a condensed one. Drive it all from scroll POSITION so it plays in reverse when the reader scrolls back up.

## The portal opening

How the hero uncovers its image.

Two opaque panels start meeting in the middle so the hero begins closed. On scroll translate them outward past their own width so they clear the frame entirely, uncovering the image behind. At the same time settle the image from a slight overscale down to 1, raise a duotone overlay from zero to a low opacity, and send two accent dots travelling out toward opposite corners of the field. Keep every value bound to scroll position, never to a timer, so the portal closes again as the reader scrolls up.

## Throwable card deck

The catalogue as a physical stack you flip through.

Stack the cards absolutely, offsetting each successive one slightly across, up, down in scale and in rotation so the stack reads as physical. On pointerdown capture the pointer and drop the transition; on pointermove track the drag with a translate plus a rotation proportional to the horizontal distance and a very slight scale up; on release, if the drag passed a threshold of roughly a tenth of the deck width, throw the card out across the deck's own width with a small lift and a roll in the direction of travel, then re-stack with the next card on top. Give the deck tabindex 0 and left/right arrow handlers, and set touch-action: pan-y so vertical scrolling still works on a phone. The deck must be usable without a mouse.

## Motion models

What is reversible and what is not.

Everything in the portal is bound to scroll position and therefore plays both ways. Entry reveals elsewhere fire once and must NOT un-reveal. Scope all reveal rules to a class added only after confirming prefers-reduced-motion is not set, so the reduced-motion and no-JS renders are the finished page. Verify the hero actually travels: something in it should move well over 100px across the first 700px of scroll, measured rather than assumed.

## Evidence rules

What the page may claim.

Only the label's own catalogue and dates. DO NOT invent press quotes, chart positions, streaming counts or award badges. Keep every release code, date and count internally consistent.