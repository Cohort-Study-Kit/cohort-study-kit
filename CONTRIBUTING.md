# Contributing to Cohort Study Kit

First off, thank you for considering contributing to Cohort Study Kit! It's people like you that help make this tool better for research communities worldwide.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of different viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible
* Include your environment details (OS, browser, etc.)

### Suggesting Enhancements

If you have a suggestion for a new feature or enhancement:

1. Use a clear and descriptive title
2. Provide a step-by-step description of the suggested enhancement
3. Provide specific examples to demonstrate the steps
4. Describe the current behavior and explain which behavior you expected to see instead
5. Explain why this enhancement would be useful to most users

### Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

### Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. Update the documentation with details of any changes to functionality
3. The PR will be merged once you have the sign-off of at least one other developer
4. If you haven't already, complete the Contributor License Agreement ("CLA")

### Local Development Setup

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
pre-commit install
```

3. Set up pre-commit hooks:
```bash
pre-commit install
```

4. Initialize database:
```bash
./manage.py migrate
./manage.py loaddata test_database
```

### Testing

- Run the test suite with: `python manage.py test`
- Ensure your code follows our style guide (we use black and flake8)
- Write or update tests for any new or modified functionality

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### Documentation

- Update documentation for any new or modified functionality
- Use clear and consistent terminology
- Include examples where appropriate
- Document any new dependencies or requirements

## Project Structure

```
copsac-web/
├── base/           # Core functionality and models
├── data/           # Data collection and form management
├── healthcare_records/  # Healthcare records management
├── config/         # Project configuration
└── docs/          # Documentation
```

## Additional Notes

### Database Changes

- Always provide migration files
- Test migrations both forwards and backwards
- Document any manual steps required

### Security Considerations

- Never commit sensitive data
- Keep authentication tokens and credentials secure
- Follow security best practices for medical data
- Report security vulnerabilities privately to maintainers

### Frontend Development

- Follow our JavaScript style guide
- Test across different browsers
- Ensure accessibility standards are met
- Maintain mobile responsiveness

## Questions?

Don't hesitate to ask questions! You can:

1. Open an issue for broader questions about the project
2. Contact the maintainers directly for security-related issues
3. Join our community discussions

## Recognition

Contributors will be added to our CONTRIBUTORS.md file. Thank you for your contributions!
