# Agent Context: pspah-website

**Last updated**: 2026-04-05

## Active Technologies

- JavaScript ES modules on React 19.1.1
- React Router DOM 7.12.x, Vite 7, Tailwind 4
- react-helmet-async and react-icons
- Vitest with jsdom for frontend regression coverage

## Project Structure

- `client/`: React/Vite frontend where the loading rearchitecture will land
- `server/`: Python backend, out of scope for this feature
- `.github/modernize/features/component-progressive-loading-ui/`: planning artifacts for the progressive loading upgrade

## Commands

- `cd client && npm test`
- `cd client && npm run test:coverage`
- `cd client && npm run build`

## Conventions

- Preserve route SEO metadata, semantic headings, and accessibility behavior during loading changes.
- Keep route-level fallback minimal; loading ownership belongs to the unresolved component, media region, collection, or action.
- Reuse and extend `client/src/components/ui/LoadingComponents.jsx` before adding new loader patterns.
- Preserve current eager-versus-lazy media intent and loading visual language while fixing fidelity mismatches.

## Recent Changes

- Generated planning artifacts for `component-progressive-loading-ui` under `.github/modernize/features/component-progressive-loading-ui/`.
- Captured implementation phases for route fallback minimization, shared loading primitives, component integration, fidelity alignment, and testing or validation.
