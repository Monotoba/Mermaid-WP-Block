# Contributing to Mermaid Content Blocks

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this together.

## Ways to Contribute

- **Report bugs** – Open an [issue](https://github.com/Monotoba/Mermaid-WP-Block/issues)
- **Suggest features** – Start an [issue](https://github.com/Monotoba/Mermaid-WP-Block/issues)
- **Submit code** – Fork, create a branch, and open a pull request
- **Improve documentation** – Fix typos, clarify instructions, add examples
- **Share feedback** – Let us know what works and what doesn't

## Getting Started

### Prerequisites

- WordPress 6.3 or later (local installation for testing)
- PHP 7.4 or later
- Node.js 14+ (optional, for JavaScript validation)
- Git

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Mermaid-WP-Block.git
   cd Mermaid-WP-Block
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Running Tests

Before submitting a pull request, run the automated checks:

```bash
bash tools/smoke-test.sh
php tests/test-plugin.php
bash tests/test-compatibility.sh
bash tests/test-doc-links.sh
```

The smoke test checks PHP and JavaScript syntax. The PHP test exercises plugin behavior without requiring a WordPress installation. The compatibility test keeps the declared WordPress requirements aligned, and the documentation test catches stale repository links. PHP checks are skipped locally when PHP is unavailable; CI runs them across every supported PHP version.

For changes that affect the packaged plugin, also build and validate the installable ZIP:

```bash
bash tools/build-plugin-zip.sh
bash tests/test-plugin-zip.sh
```

### Code Style

- **PHP** – Follow WordPress coding standards
- **JavaScript** – Use consistent indentation (2 spaces)
- **Comments** – Keep explanations clear and concise
- **Functions** – Use descriptive names; document with PHPDoc/JSDoc where helpful

## Making Changes

### PHP Files

- Use proper escaping for output (`esc_html`, `esc_attr`, etc.)
- Use WordPress sanitization functions for input
- Follow the existing code style and structure
- Add comments for complex logic

### JavaScript Files

- Use ES6+ syntax where appropriate
- Comment non-obvious code sections
- Validate syntax with `node --check`
- Follow the existing indentation style

### Block Configuration

- Update `block.json` for new block attributes or metadata
- Document attribute purposes and defaults
- Keep the block structure clean and maintainable

## Submitting Changes

### Before Creating a Pull Request

1. **Run tests** – Run both automated checks listed above
2. **Test manually** – Follow [manual-test-plan.md](tests/manual-test-plan.md)
3. **Verify functionality** – Ensure your changes work as intended
4. **Update documentation** – Add or modify docs if behavior changed
5. **Update CHANGELOG.md** – Note user-visible changes under an "Unreleased" section

### Creating a Pull Request

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Open a PR on GitHub** with:
   - A clear title describing the change
   - A description of what changed and why
   - A reference to any related issues (#123)
   - A checklist of testing performed
3. **Respond to feedback** – We may request changes before merging

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Automated checks pass
- [ ] Manual testing is completed where relevant
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated for user-visible changes
- [ ] No unnecessary commits or debug code remain
- [ ] Commit messages are clear and descriptive

## Reporting Issues

When reporting a bug, include:

- **WordPress and PHP versions** – Check Tools > Site Health in WordPress
- **Steps to reproduce** – Be specific and detailed
- **Expected behavior** – What should happen
- **Actual behavior** – What happens instead
- **Screenshots** – If relevant
- **Error messages** – From the browser console or server logs

Do not include passwords, private site data, or vulnerability details in a public issue.

## Suggesting Features

When suggesting a feature:

- **Explain the use case** – Why is this needed?
- **Describe the feature** – What should it do?
- **Consider alternatives** – Are there existing workarounds?
- **Performance impact** – Could it slow down rendering?

## Security

Please follow the private reporting instructions in [SECURITY.md](SECURITY.md). Do not disclose vulnerability details in a public issue.

## Licensing

By contributing, you agree that your code will be licensed under the [MIT License](LICENSE). Ensure you only submit code you have rights to contribute.

## Releases

The `Release Package` workflow validates and stores an installable plugin ZIP.
For a public release, run `bash tools/build-plugin-zip.sh` and
`bash tests/test-plugin-zip.sh`, then create a GitHub release for the matching
`v<plugin version>` tag and attach `build/mermaid-content-blocks.zip`.

## Questions?

Open an [issue](https://github.com/Monotoba/Mermaid-WP-Block/issues) on GitHub.

Thank you for contributing! 🎉
