# Unified QA Security Platform

Agent-native QA and security testing harness for web apps. Think BrowserStack plus a DAST scanner, designed for AI agents to call automatically.

## What is built

This repo implements a working Phase 1 loop and clean extension points for the full roadmap.

### Working Phase 1

- API endpoint to start a run: `POST /api/runs`
- Async-style run records with statuses: queued, running, passed, failed, error
- Phase 1 worker that loads a target URL, validates a rendered response, optionally checks expected text, and normalizes findings
- Machine-readable result endpoint: `GET /api/runs/:id/result`
- SARIF endpoint: `GET /api/runs/:id/sarif`
- Retest endpoint: `POST /api/runs/:id/retest`
- In-memory run store for local MVP use
- Normalized JSON schema with stable finding IDs, severity, location, evidence, reproduction, remediation, score, and verdict
- Gating policy for blocking high/critical findings and smoke failures
- Dashboard with run launcher and architecture overview
- Unit tests for stable IDs, findings, scoring, and gating

### Stubbed extension points

- Playwright adapter for browser matrix execution
- axe-core adapter for accessibility
- Lighthouse adapter for performance
- Semgrep/CodeQL adapter for SAST
- Trivy/Snyk/Dependency Check adapter for SCA
- gitleaks/trufflehog adapter for secrets
- OWASP ZAP/Nuclei adapter for DAST
- Real device cloud adapter
- Sandbox, artifact storage, trend dashboard, suppressions, and multi-tenant hardening

## API quick start

```bash
curl -s -X POST http://localhost:3000/api/runs \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com","profile":"fast","expectedText":"Example Domain"}'
```

Then fetch:

```bash
curl http://localhost:3000/api/runs/<runId>
curl http://localhost:3000/api/runs/<runId>/result
curl http://localhost:3000/api/runs/<runId>/sarif
```

## Run profiles

- `fast`: commit/PR profile. Smoke and functional QA plus SAST, SCA, and secrets extension points.
- `full`: post-deploy staging profile. Cross-browser QA, accessibility, performance, and DAST extension points.
- `deep`: pre-release profile. Full matrix plus visual, E2E, and deeper security scans.
- `scheduled`: nightly/weekly profile for new CVEs, baseline DAST, and trends.

## Gating policy

Blocks:

- Critical or high security findings
- Committed secrets
- Failed smoke tests
- Failed Tier 1 browser functional tests

Warns:

- Medium and low findings
- Reviewed visual diffs
- Small performance overages
- Accessibility issues below configured threshold

Suppressions must include a written justification, owner, and expiry.

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## Database

A Postgres schema is included at `db/schema.sql` for targets, runs, findings, matrix results, artifacts, and suppressions.

## Hardening checklist

Before production:

- Replace in-memory store with Postgres.
- Add API authentication and rate limits.
- Run every job in an isolated, ephemeral container.
- Restrict network egress to approved scopes.
- Store auth configs and scanner credentials in a secrets manager.
- Add tenant authorization checks to every read/write.
- Persist artifacts to object storage with signed URLs.
- Dogfood the platform against itself on every release.

## Verification status

This repo was locally verified with:

- Unit tests
- Lint
- Production build
- Browser rendering check
- API run creation and result retrieval
