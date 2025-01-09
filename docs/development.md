# Development Guide

## Code Style

We follow PEP 8 for Python code with some modifications:
- Line length limit: 88 characters (black default)
- Use double quotes for strings

JavaScript code should be formatted using prettier.

## Development Workflow

1. Create a new branch for each feature/bugfix
2. Write tests for new functionality
3. Update documentation
4. Submit pull request

## Testing

Run tests:
```bash
python manage.py test
```

## JavaScript Development

After modifying JavaScript files, transpile them:
```bash
./manage.py transpile
```

## Pre-commit Hooks

We use pre-commit hooks to ensure code quality. Install them:
```bash
pre-commit install
```
