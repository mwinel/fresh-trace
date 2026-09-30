# Fresh Trace — Frontend Engineering Guide

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Role and objective

Act as an expert frontend engineer with strong product, accessibility, and UI design judgment. Build a clean, responsive Fresh Trace interface using Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

Keep the implementation simple, modular, and DRY. Prefer clear code and focused components over clever abstractions. Deliver complete, usable interactions within the requested scope.

## Current scope

- Use typed, local static fixtures. No database connections, authentication integrations, API routes, server actions, or external data services unless explicitly requested.
- Make search, filters, sorting, pagination, dialogs, forms, and navigation work locally when present in the requested design.
- Demo edits live in memory and reset on refresh. Do not add localStorage or other persistence unless requested. Make this limitation clear where users save or edit data.
- Do not imply that demo actions send emails, publish reports externally, or permanently save records. Give accurate feedback about what happened.
- Static data does not require static-export deployment. Preserve the project's existing rendering and deployment configuration.
- Do not add speculative backend layers, repositories, API clients, state libraries, or generic CRUD frameworks.

## Before making changes

1. Read applicable repository instructions and inspect the existing implementation.
2. Check `package.json`, the lockfile, TypeScript configuration, `components.json`, global styles, and installed UI components.
3. Use the existing package manager, import aliases, directory conventions, and dependencies. Do not change framework versions as part of ordinary UI work.
4. Read the relevant installed Next.js documentation. If unavailable, use official documentation matching the installed version and state any unresolved limitation.
5. Check the installed Tailwind and shadcn/ui setup before using version-dependent configuration or component APIs. Do not mix Radix and Base UI composition patterns.
6. Inspect the supplied design reference for the current task. Preserve established colors, typography, spacing, and interaction patterns. Do not invent design measurements when the reference can be inspected.

## Architecture and ownership

Use the existing structure where possible. For a new App Router project, the following is a guide, not a requirement to create empty folders. Omit `src/` if the repository does not use it.

```text
src/
  app/
    layout.tsx
    globals.css
    (dashboard)/
      layout.tsx
      page.tsx
      samples/page.tsx
      reports/page.tsx
      analysis/page.tsx
      team/page.tsx
      settings/page.tsx
  components/
    ui/                  # Installed shadcn/ui primitives
    layout/              # Shared app header, sidebar, dashboard shell
    shared/              # Components reused across features
  features/
    samples/
      components/
      data.ts            # Typed fixtures
      types.ts           # Feature domain types
      utils.ts           # Pure helpers, only when needed
    reports/
    analysis/
    team/
    settings/
  config/
    navigation.ts
  lib/
    utils.ts             # Existing cn() utility
    format.ts            # Shared formatters, when needed
```

- Route files compose feature views and supply fixtures; keep complex UI and behavior in feature components.
- Shared dashboard layouts own the header and sidebar. Do not copy the app shell into individual pages.
- Keep feature-specific components, types, fixtures, and helpers together. Promote them to shared locations only when genuinely reused.
- Keep domain logic out of `components/ui`. Extend primitives through composition and purposeful variants.
- Features may depend on shared modules. Avoid circular dependencies and importing another feature's internal components.
- Prefer direct imports. Avoid broad barrel exports that obscure ownership or client/server boundaries.

## Component design and DRY

- Give each component one coherent responsibility. Split by responsibility, reuse, or interaction boundary—not arbitrary line counts.
- Reuse recurring patterns such as page headers, status badges, metric cards, and filter controls when their behavior and appearance align.
- Do not extract a component for every wrapper or build universal components with many unrelated boolean props.
- Prefer explicit typed props and composition through children or named slots.
- Keep state close to the UI that owns it. Lift state to the nearest common parent when multiple components need it.
- Use one source of truth for navigation, status labels, status styles, and domain constants.
- Small duplication is acceptable when two concepts may evolve differently. Abstract after a real shared pattern emerges.

## Next.js and React

- Use Server Components by default where supported by the existing router. Add `"use client"` at the smallest practical boundary that needs state, event handlers, hooks, or browser APIs.
- Do not make the entire root layout a Client Component for one interactive child.
- Pass only necessary serializable data across server/client boundaries. Define event handlers and component references on the appropriate side of that boundary.
- Use framework navigation primitives for internal links and the existing project approach for images and fonts.
- Derive filtered rows, counts, and other computed values from source state. Do not duplicate derived values in state or synchronize them with effects.
- Use effects for external synchronization, not routine calculations or click-driven actions.
- Use stable record IDs for list keys. Never generate random values during render or use array indices for mutable lists.
- Avoid hydration differences from random fixtures, browser-only reads during server render, or uncontrolled time and locale formatting.
- Add memoization, lazy loading, virtualization, or other optimization only when justified by actual cost. Keep large fixtures and heavy dependencies out of shared client entry points.

## TypeScript and static data

- Use strict, explicit domain types. Avoid `any`, unexplained assertions, and disabling type checks to hide problems.
- Model finite statuses with string literal unions. Keep display labels separate from stored values.
- Use camelCase for properties, PascalCase for React components and types, and the repository's filename convention.
- Store fixtures outside JSX. Use stable IDs, realistic linked records, ISO date values, and explicit measurement units.
- Keep related data consistent: report sample IDs must exist, counts must match their source records, and charts must agree with their summaries.
- Do not mutate imported fixtures. Create local state from fixtures when editing is required and update it immutably.
- Compute dashboard summaries from the relevant fixture set when practical. Clearly distinguish deliberately independent illustrative metrics.
- Keep filtering, sorting, validation, and formatting as small pure functions when extraction improves clarity or reuse.
- Use a deliberate locale and timezone for date/time displays. Treat date-only values as date-only to avoid unintended day shifts.
- Include useful edge cases such as missing optional values, long names, and empty filter results.

## Tailwind CSS and shadcn/ui

- Reuse installed shadcn/ui components before building custom equivalents. Consult the component documentation and inspect local source before assuming props are supported.
- Add only components needed by the task. Do not reinstall or overwrite customized primitives without reviewing the changes.
- Use the project's semantic tokens for backgrounds, foregrounds, borders, muted content, primary actions, and destructive actions.
- Define Fresh Trace brand and status tokens centrally. Avoid repeating raw color values across pages.
- Keep reusable visual changes in component variants or theme tokens. Use `className` primarily for layout and local positioning.
- Use the existing `cn()` helper for conditional Tailwind classes. Avoid dynamically constructed class names that Tailwind cannot detect.
- Prefer flex/grid with consistent gaps. Keep custom CSS focused on cases utilities cannot express clearly.
- Preserve accessible primitive behavior, including focus management, keyboard interaction, and appropriate trigger composition.
- Use a consistent installed icon library. Decorative icons should be hidden from assistive technology; icon-only actions need accessible names.
- Avoid adding dependencies for behavior already covered by React, browser APIs, or existing components.

## Fresh Trace dashboard conventions

- Use one reusable header with the logo on the left and user avatar/menu on the right.
- Use one reusable sidebar with this order: Overview, Samples, Reports, Analysis, Team, Settings.
- Define menu labels, destinations, and icons centrally. Derive active navigation from the current route, including nested routes.
- Use compact 40 px desktop sidebar menu rows and consistent spacing. Provide adequately sized touch targets on smaller screens.
- Preserve the established shared background treatment across the header, sidebar, and overview shell. Use surface tokens to distinguish content cards and panels.
- Each page should have a clear title, concise context where useful, and a prominent primary action only when relevant.
- Use status text alongside color. Never communicate test outcomes or workflow status through color alone.
- Preserve the approved dairy quality workflow and terminology. Do not invent laboratory thresholds, approval rules, or pass/fail criteria; request missing domain rules when they affect implementation.
- Use responsive layouts with a collapsible or sheet-based mobile navigation. Contain wide tables within their own scroll region rather than overflowing the page.

## Interaction and accessibility

- Use semantic landmarks, a logical heading hierarchy, real buttons for actions, and links for navigation.
- Every visible control must work within the demo scope or be clearly disabled with an explanation. Avoid dead buttons and placeholder `#` links.
- Support keyboard operation, visible focus, readable contrast, and reduced-motion preferences.
- Give inputs associated labels and useful validation messages. Connect error messages to the relevant controls.
- Dialogs and sheets need accessible titles, predictable close behavior, and focus restoration.
- For forms, choose the simplest suitable state approach. Use existing form and validation libraries when complexity warrants them; avoid adding a library for a trivial form.
- Search and filters should combine predictably. Reset or clamp pagination when filters or page size change.
- Distinguish an empty dataset from no matching search results and offer an appropriate next step.
- Use existing sorting/table utilities when available. Start with a simple table unless advanced behavior requires more.
- Confirm destructive demo actions where appropriate and describe their in-memory effect accurately.
- Do not add fake loading delays, skeletons, or error states to synchronous static data merely to resemble a backend.

## Verification and delivery

- Run the repository's applicable lint, type-check, and build scripts. Report unavailable scripts and unresolved failures accurately; never claim checks that were not run.
- Check changed screens at desktop and mobile widths. Verify overflow, long content, active navigation, keyboard focus, and relevant empty states.
- Exercise the interactions introduced or changed, including form validation and combined search/filter/pagination behavior where applicable.
- Add focused tests for meaningful logic or regressions. Avoid snapshot-heavy tests and tests that merely reproduce the implementation. Do not introduce an entire test stack for a simple visual change.
- Keep the change focused. Preserve unrelated user work and avoid incidental formatting or dependency churn.
- Summarize what changed, what was verified, and any remaining limitations. Flag assumptions that materially affect the UX or domain behavior.

## Definition of done

The requested UI matches the supplied design closely, uses coherent reusable components, behaves correctly with static data, works across relevant screen sizes, is accessible, and passes the available relevant checks. No backend integration or unnecessary architectural layer has been added.
