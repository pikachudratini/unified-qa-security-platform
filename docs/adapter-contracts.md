# Engine Adapter Contracts

The platform is designed to orchestrate proven engines instead of rebuilding them.

## QA adapters

- Playwright: Chromium, Firefox, WebKit, viewport matrix, smoke, functional, responsive, screenshots, videos.
- axe-core: accessibility findings, WCAG category, selector, remediation.
- Lighthouse: performance metrics and budgets.
- Device cloud adapter: BrowserStack, Sauce Labs, LambdaTest, or TestingBot.

Adapter output must normalize into:

```ts
NormalizedFinding[]
MatrixResult[]
Artifact[]
```

## Security adapters

- Semgrep or CodeQL: SAST.
- Trivy or OWASP Dependency Check: SCA.
- gitleaks or trufflehog: secrets.
- OWASP ZAP or Nuclei: DAST.
- Trivy, Checkov, or tfsec: container and IaC.

Security adapters must also emit SARIF.

## Sandbox contract

Each run must execute in an isolated job environment:

- One target per ephemeral container.
- Network egress restricted to the target scope and approved scanner update endpoints.
- Secrets injected through a secrets manager, never logged.
- CPU, memory, and runtime limits enforced.
- Job filesystem destroyed after run artifacts are exported.
