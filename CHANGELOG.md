# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-11

### Added
- Initial release of Mermaid Content Blocks
- Mermaid Diagram block for WordPress block editor
- Support for all Mermaid diagram types (flowcharts, sequence diagrams, class diagrams, state diagrams, etc.)
- Multiple theme options (default, neutral, dark, forest, base)
- Optional caption support for diagrams
- Optional source code display below rendered diagrams
- Live preview in block editor
- Frontend rendering with Mermaid 11.15.0
- Strict security configuration to prevent XSS attacks
- Content Security Policy documentation
- Comprehensive manual testing procedures
- Smoke test script for PHP and JavaScript validation
- GitHub Actions CI/CD workflows

### Security
- Mermaid strict security level enabled
- HTML labels disabled
- Mermaid version pinned to 11.15.0
- All user input properly escaped before rendering
- No admin capability escalation
