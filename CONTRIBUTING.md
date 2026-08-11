# Contributing to Dubly

Thank you for your interest in contributing to Dubly!

## Guidelines

1. **Monorepo Workflow**: Dubly uses `bun` for managing workspace packages.
2. **TypeScript & Rust**: Ensure TypeScript strict mode compliance and run `cargo clippy` on Rust changes.
3. **No Code Comments**: Maintain the clean codebase standard without inline comments.
4. **No CSS Gradients**: Follow the solid color design system for UI components.
5. **Internationalization**: Add key translations to `en.json` and `fa.json` for any new UI text.

## Local Setup

```bash
bun install
bun run dev
```

To test Tauri features:

```bash
cd apps/desktop
bun tauri dev
```

## Pull Request Process

1. Fork the repository and create your feature branch.
2. Ensure all typechecks and builds pass (`bun run check` and `bun run build`).
3. Submit a Pull Request detailing your changes.
