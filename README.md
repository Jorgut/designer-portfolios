# Refcases

A curated library of designer portfolios with visual, interaction, and information-structure analysis.

Refcases focuses on high-quality personal portfolio websites from designers, product designers, design engineers, architects, and spatial designers. It is not a general bookmark collection. Each entry should help answer: what is worth studying here, and why?

## Focus

- Designer personal websites and portfolio case studies
- Visual language: typography, layout, spacing, rhythm, color, hierarchy
- Interaction: navigation, motion, scroll behavior, feedback
- Information structure: project storytelling, content density, case-study sequencing

## Categories

- Architecture
- Interior
- UX/UI
- Product
- Design Engineering

## Repository

```text
designer-portfolios/
├── data/                 # Portfolio source data
├── web/                  # Next.js frontend
├── scripts/              # Discovery and evaluation helpers
├── docs/                 # Notes and candidate lists
└── assets/               # Screenshots, logos, avatars
```

## Reference Intake

The project can keep external inspiration sources as triage data without turning them into accepted portfolio cases.

- `data/eidos-references.json`: full public-link index captured from EIDOS, limited to source fields plus Refcases discipline and duplicate metadata.
- `data/eidos-candidates.json`: filtered subset that may be useful for Refcases, mapped into the Refcases taxonomy.
- `data/developer-portfolios-references.json`: full public-link index captured from Emma Bostian's `developer-portfolios` repo, limited to source fields plus Refcases discipline and duplicate metadata.
- `data/developer-portfolios-candidates.json`: filtered subset surfaced for Refcases as an adjacent reference pool, mapped into the Refcases taxonomy.
- Candidate entries are not endorsed cases yet. Promote them into `data/portfolios.json` only after manual review and original analysis.

External candidates are normalized against the same five categories used by the main library:

- Architecture
- Interior
- UX/UI
- Product
- Design Engineering

The frontend also performs duplicate checks by canonical URL against the main library. Duplicate candidate entries remain visible as source evidence, but they are marked as already accepted in the main library instead of being treated as new cases.

## Run Locally

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Add A Portfolio

Add entries to `data/portfolios.json` or use `PORTFOLIO_TEMPLATE.md` as the review format.

Good entries should include:

- A live portfolio URL
- The designer or studio name
- Discipline/category
- A short reason the site is worth studying
- Tags such as `case-study`, `motion`, `editorial-layout`, `design-systems`, or `3d-web`

## Quality Bar

Refcases should stay selective. Avoid adding sites that are only visually trendy but do not offer useful lessons in layout, interaction, storytelling, or craft.
