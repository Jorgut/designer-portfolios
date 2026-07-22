## Portfolio discovery review

This automated run found **{{candidate_count}}** new candidate portfolio(s) for maintainer review.

- Generated at: `{{generated_at}}`
- Source set: Awwwards, Siteinspire, CSS Design Awards
- Data files were not modified directly; this PR only proposes review candidates in `docs/candidates.md`

## Candidates

| Name | Website | Discipline | Quality Score | Notes |
| --- | --- | --- | ---: | --- |
{{candidate_rows}}

## Review checklist

{{candidate_checklist}}

## Merge instructions

1. Open each candidate website and confirm quality manually.
2. For approved entries, add them to `data/portfolios.json` and `web/src/data/portfolios.json` in a follow-up commit or follow-up PR.
3. Reject anything that is not a personal portfolio, lacks substantive case studies, or does not meet the project bar.
4. Merge this PR after review is complete so the discovery run is recorded.

## Scrape warnings

{{warnings}}
