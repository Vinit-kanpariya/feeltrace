---
phase: 01-data-foundation-and-security-baseline
plan: 02
subsystem: security-ssrf-validator
tags: [ssrf, security, dns, tdd, vitest, node-dns]
dependency_graph:
  requires: [01-01]
  provides: [src/lib/ssrf.ts, src/lib/ssrf.test.ts]
  affects: [src/app/api/analyze/route.ts (Plan 05)]
tech_stack:
  added:
    - jsdom (dev — missing vitest jsdom peer dependency)
  patterns:
    - TDD RED/GREEN cycle with vi.mock('node:dns') for unit isolation
    - dns.promises.lookup with { all: true } for encoding-immune SSRF protection
    - Integer range math for IP classification (immune to octal/hex/decimal encoding)
key_files:
  created:
    - src/lib/ssrf.ts
    - src/lib/ssrf.test.ts
  modified:
    - package.json (added jsdom devDependency)
    - package-lock.json
decisions:
  - "Used Pattern 3 from RESEARCH.md verbatim — dns.promises.lookup with { all: true } checks all resolved IPs, preventing multi-A-record bypass"
  - "jsdom installed as devDependency — was a missing peer dependency for vitest jsdom environment not surfaced during Plan 01 scaffold"
  - "vi.mock structure uses both default export and named export shapes to handle how vitest handles node: protocol imports"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-05-21"
  tasks_completed: 2
  files_created: 2
  tdd_gates:
    red: "672176d — test(01-02): add failing SSRF validator unit tests (RED gate)"
    green: "1f9bc8e — feat(01-02): implement SSRF validator utility (GREEN gate)"
    refactor: "none needed — implementation was clean from RESEARCH.md Pattern 3"
---

# Phase 1 Plan 2: SSRF Validator Summary

DNS-resolution-based SSRF validator using `dns.promises.lookup` with `{ all: true }` — encoding-immune protection blocking RFC-1918, loopback, link-local/cloud metadata, and non-http schemes, with 9 passing unit tests using vi.mock for complete isolation.

---

## Tasks Completed

| Task | Name | Status | Commit |
|------|------|--------|--------|
| RED | Write failing SSRF unit tests (9 cases) | COMPLETE | 672176d |
| GREEN | Implement validateUrl + SsrfError in ssrf.ts | COMPLETE | 1f9bc8e |

---

## What Was Built

**`src/lib/ssrf.ts`** — SSRF validator utility:
- `SsrfError` class extending `Error` with typed `code` property: `'BLOCKED_SCHEME' | 'INVALID_URL' | 'DNS_RESOLUTION_FAILED' | 'BLOCKED_IP'`
- `validateUrl(rawUrl: string): Promise<void>` — async function that:
  1. Parses URL with `new URL()`, throws `SsrfError(INVALID_URL)` on parse failure
  2. Enforces `http:` / `https:` schemes only — throws `SsrfError(BLOCKED_SCHEME)` otherwise (D-14)
  3. Calls `dns.promises.lookup(hostname, { all: true })` — resolves ALL IPs (encoding-immune)
  4. Checks each IPv4 address against `BLOCKED_RANGES` (loopback 127.x, RFC-1918 10.x/172.16-31.x/192.168.x, link-local 169.254.x, unspecified 0.x)
  5. Checks each IPv6 address for `::1` (loopback) and `fe80:` prefix (link-local)

**`src/lib/ssrf.test.ts`** — 9 unit tests using `vi.mock('node:dns')`:
- Test 1: valid public URL (93.184.216.34) → resolves undefined
- Test 2: RFC-1918 10.0.0.1 → BLOCKED_IP
- Test 3: RFC-1918 172.16.0.1 → BLOCKED_IP
- Test 4: RFC-1918 192.168.1.1 → BLOCKED_IP
- Test 5: localhost 127.0.0.1 → BLOCKED_IP
- Test 6: link-local/cloud metadata 169.254.169.254 → BLOCKED_IP
- Test 7: file:///etc/passwd → BLOCKED_SCHEME (no DNS lookup)
- Test 8: ftp://example.com/file → BLOCKED_SCHEME (no DNS lookup)
- Test 9: IPv6 loopback ::1 → BLOCKED_IP

---

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED — `test(...)` commit with failing tests | 672176d | PASSED |
| GREEN — `feat(...)` commit with all tests passing | 1f9bc8e | PASSED |
| REFACTOR | skipped — no cleanup needed | N/A |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocker] jsdom missing as vitest peer dependency**
- **Found during:** RED phase test run
- **Issue:** `vitest run` failed with `Cannot find package 'jsdom'` — the jsdom environment peer dep was not installed during Plan 01 scaffold
- **Fix:** `sfw npm install --save-dev jsdom` added jsdom to devDependencies
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** included in RED commit 672176d

---

## Known Stubs

None — this module has no stubs. The SSRF validator is fully implemented and tested. It will be imported by `POST /api/analyze` (Plan 05) when the full route handler is built.

---

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: ssrf-validation-surface | src/lib/ssrf.ts | This file is the SSRF mitigation itself (T-01-03, T-01-04, T-01-05). All three threats are mitigated per plan threat model. No new unplanned threat surface introduced. |

---

## Self-Check

- [x] `src/lib/ssrf.ts` exists and exports `validateUrl` and `SsrfError`
- [x] `src/lib/ssrf.test.ts` exists with 9 test cases using `vi.mock('node:dns')`
- [x] `npm run test:run src/lib/ssrf.test.ts` exits 0 with 9 tests passing
- [x] `npm run typecheck` exits 0 after adding ssrf.ts
- [x] RED commit exists: 672176d
- [x] GREEN commit exists: 1f9bc8e
- [x] All 9 D-16 test cases pass (valid public, RFC-1918 ×3, localhost, link-local, file://, ftp://, IPv6 loopback)
- [x] No real DNS calls made during test suite (vi.mock isolation confirmed)

## Self-Check: PASSED
