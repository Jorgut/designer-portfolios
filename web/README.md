# Refcases Web

Next.js frontend for Refcases, a curated designer portfolio case library.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Content Source

Portfolio entries are loaded from `src/data/portfolios.json`.
EIDOS candidate references are loaded from `src/data/eidos-candidates.json`.
Developer portfolio references are loaded from `src/data/developer-portfolios-candidates.json`.

The homepage presents each portfolio through:

- discipline
- location
- tags
- live screenshot
- study focus

The EIDOS section is a triage queue. It keeps factual fields only, such as title, URL, source, and tags, and should not be treated as an accepted Refcases entry until it has original analysis.
The developer-portfolios section is the same idea for Emma Bostian's portfolio index.

## Positioning

Refcases is narrower than a general inspiration database. It is for studying designer portfolio websites through visual language, interaction, and information structure.
