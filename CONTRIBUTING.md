# Contributing to Mermaid Content Blocks

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this together.

## Ways to Contribute

- **Report bugs** – Open an [issue](https://github.com/Monotoba/mermaid-content-blocks/issues)
- **Suggest features** – Start a [discussion](https://github.com/Monotoba/mermaid-content-blocks/discussions)
- **Submit code** – Fork, create a branch, and open a pull request
- **Improve documentation** – Fix typos, clarify instructions, add examples
- **Share feedback** – Let us know what works and what doesn't

## Getting Started

### Prerequisites

- WordPress 7.0 or later (local installation for testing)
- PHP 7.4 or later
- Node.js 14+ (optional, for JavaScript validation)
- Git

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mermaid-content-blocks.git
   cd mermaid-content-blocks
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Running Tests

Before submitting a pull request, validate your changes:

```bash
bash tools/smoke-test.sh
```

This checks:
- PHP syntax validity
- JavaScript syntax validity

### Code Style

- **PHP** – Follow WordPress coding standards
- **JavaScript** – Use consistent indentation (2 spaces)
- **Comments** – Keep explanations clear and concise
- **Functions** – Use descriptive names; document with PHPDoc/JSDoc where helpful

## Making Changes

### PHP Files

- Use proper escaping for output (esc_html, esc_attr, etc.)
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

1. **Run tests** – `bash tools/smoke-test.sh`
2. **Test manually** – Follow [manual-test-plan.md](tests/manual-test-plan.md)
3. **Verify functionality** – Ensure your changes work as intended
4. **Update documentation** – Add/modify docs if behavior changed
5. **Update CHANGELOG.md** – Note your changes under an "Unreleased" section

### Creating a Pull Request

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Open a PR on GitHub** with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to any related issues (#123)
   - Checklist of testing performed
3. **Respond to feedback** – We may request changes before merging

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass (`bash tools/smoke-test.sh`)
- [ ] Manual testing completed (see test plan)
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] No unnecessary commits or debug code
- [ ] Commit messages are clear and descriptive

## Reporting Issues

When reporting a bug, include:

- **WordPress & PHP versions** – Check admin > Site Health
- **Steps to reproduce** – Be specific and detailed
- **Expected behavior** – What should happen
- **Actual behavior** – What happens instead
- **Screenshots** – If relevant
- **Error messages** – From browser console or server logs

## Suggesting Features

When suggesting a feature:

- **Explain the use case** – Why is this needed?
- **Describe the feature** – What should it do?
- **Consider alternatives** – Are there existing workarounds?
- **Performance impact** – Could it slow down rendering?

## Security

If you discover a security vulnerability, please email the maintainer privately rather than opening a public issue. See the repository security policy for details.

## Licensing

By contributing, you agree that your code will be licensed under the [MIT License](LICENSE). Ensure you only submit code you have rights to contribute.

## Questions?

Open a [discussion](https://github.com/Monotoba/mermaid-content-blocks/discussions) or [issue](https://github.com/Monotoba/mermaid-content-blocks/issues) on GitHub.

Thank you for contributing! 🎉
