# Contributing to Kafka UI

First off, thank you for considering contributing to Kafka UI! We welcome any contributions that improve the project.

## How to Contribute

- **Reporting Bugs**: If you find a bug, please open an issue and provide detailed steps to reproduce it.
- **Suggesting Enhancements**: If you have an idea for a new feature, open an issue to discuss it.
- **Pull Requests**: If you're ready to contribute code, please follow the steps below.

## Pull Request Process

1.  **Fork the repository** and create a new branch from `main`.
    ```bash
    git checkout -b feature/your-amazing-feature
    ```

2.  **Make your changes**. Please adhere to the project's code style.
    - **Backend**: Run `go fmt ./...` to format your Go code.
    - **Frontend**: Run `npm run lint` to check your React code.

3.  **Test your changes**. Make sure all existing tests pass and add new tests for your new features.
    - `make test-backend`
    - `make test-frontend`

4.  **Update the documentation**. If you've added a new feature or changed an API, please update the relevant documentation in the `docs` directory.

5.  **Submit a pull request**. Push your branch to your fork and open a pull request to the main repository. Provide a clear description of your changes.

## Development Setup

For detailed instructions on how to set up your local development environment, please see the [Development Setup Guide](./setup.md).

## Code Style

### Backend (Go)
- We follow the standard Go conventions. Please run `go fmt` before committing.
- Add comments to explain complex or non-obvious logic.

### Frontend (React)
- We use Prettier and ESLint to enforce a consistent code style. Please run `npm run lint` to check your code.
- We use functional components with hooks.

## Commit Messages

We use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps us automate changelogs and releases.

**Format:** `type(scope): description`

**Example:**
```
feat(api): add new endpoint for consumer group metrics
fix(frontend): correct the pagination on the topics table
docs(readme): update the quick start guide
```

---

Thank you again for your interest in contributing! 