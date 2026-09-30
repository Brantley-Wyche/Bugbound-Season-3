# Bugbound Season 3

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Experienced React developers who want challenging, self-directed debugging practice in their local editor and browser. Season 3 is the final season and targets the judgment and independence of a senior developer.

## Product Purpose

Learners direct an external AI coding agent to generate intentionally buggy exercises, investigate the resulting behavior, edit the actual source, and verify their repairs against behavioral checks. Success means understanding and explaining a robust repair.

## Operating Context

The existing app uses React 19 and Vite with npm. It runs locally beside a source editor. The app prepares prompts and exports a learning profile; it does not invoke an agent or observe its execution. Generated manifests are discovered from the repository. Discovery does not prove validation.

## Capabilities and Constraints

- Choose freely among incidents, with an explained suggested next incident. Confirmed by the user on 2026-09-12.
- Retain the original curriculum as browsable Foundations; generated practice leads the Season 3 experience.
- Preserve all existing exercise source, manifests, checks, data-testid attributes, encoded hints and solutions, and blind mode.
- Season 3 may use npm dependencies and actual library components installed through their documented workflow (user confirmed 2026-09-12). Preserve the existing React/Vite architecture and assess compatibility; generated exercises retain their separate package-import restriction.
- Generation, investigation, and optional help have distinct purposes. Never reveal planted causes in shell content or generation feedback.
- Browser preview and check execution are not a security sandbox.
- Season 3 lives in its own Bugbound-Season-3 repository. Its main branch is the pristine cartridge; generation and learner repairs use separate branches. The original Season 1 repository and the sibling Season 2 project are reference sources only.
- Rich run history, evidence comparison, and generation recovery are candidates for the later reliability/architecture stage, not existing capabilities.

## Brand Commitments

Bugbound retains its user-created icon and the family resemblance to Season 1's Field Notebook and Season 2's Investigation Desk. The user approved the Engineering Lab direction: precise, readable, and approachable, with mastery expressed through investigative control.

## Product Principles

- Give learners agency and make recommendations understandable.
- Show evidence with its actual scope; a saved repair does not establish current correctness.
- Offer reference and hints without judging their use.
- Represent the external agent handoff honestly.
- Protect the learning exercise as the product's executable specification.

## Accessibility & Inclusion

Desktop-first exercises require editing and running real source code. Keep this explanation visible on smaller devices while keeping incidents, briefs, and references browsable. Support keyboard navigation, readable contrast, reduced motion, and zoom.
