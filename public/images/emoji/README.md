# Third-party emoji artwork

## tada.svg

The 🎉 party-popper used on the Good Dog Library QR card
(`scripts/generate-qr-poster.mjs`).

- Source: Twemoji, https://github.com/twitter/twemoji (`assets/svg/1f389.svg`)
- Copyright 2019 Twitter, Inc and other contributors
- Graphics licensed **CC-BY 4.0**: https://creativecommons.org/licenses/by/4.0/

CC-BY 4.0 requires attribution when the artwork is distributed. This file is
that attribution for the repository and for anything generated from it,
including the printed card.

Vendored rather than fetched at generation time so `pnpm generate-qr` stays
offline and reproducible. It is drawn as vector paths in both the SVG and the
PDF, because PDF's built-in Helvetica has no emoji glyphs at all: setting 🎉 as
text produces mojibake in the print file rather than a picture.
