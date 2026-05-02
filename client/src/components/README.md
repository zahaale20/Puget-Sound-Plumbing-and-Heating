# Component boundaries

Keep React components in one scoped hierarchy:

- `layout/` contains app chrome and site-wide layout pieces.
- `sections/` contains reusable page sections.
- `forms/` contains form-driven feature components.
- `ui/` contains small primitives, loaders, and generic UI infrastructure.
- `seo/` contains metadata helpers.

Do not add or import root-level component files from `src/components`. Use a scoped directory instead. ESLint enforces this for imports such as `./components/Footer` or `../components/Footer` so old duplicate trees do not return.