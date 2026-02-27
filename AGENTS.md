# AGENTS.md - AI Agent Guidelines for Cohort Study Kit

This document provides guidance for AI coding assistants working on the Cohort Study Kit project.

## Project Overview

Cohort Study Kit is a Django-based platform for managing longitudinal cohort studies. Originally developed for COPSAC (Copenhagen Prospective Studies on Asthma in Childhood), it's designed to help research teams systematically collect, store, and manage data from study participants over time.

**License**: GNU Lesser General Public License (LGPL)
**Primary Language**: Python 3.12+ (3.14+ recommended)
**Framework**: Django 5.2.7
**Database**: MariaDB (production) / SQLite (development)

## Architecture & Project Structure

```
cohort-study-kit/
├── base/                    # Core functionality and models
│   ├── models/             # Proband, Relative, Address, Consent, Note, Cohort
│   ├── views/              # Core views for participant management
│   ├── templates/          # Base templates
│   └── static/             # Base static assets
├── data/                    # Data collection and forms
│   ├── models/             # Dataset, Examination, Visit, Cell, Column
│   ├── views/              # Data collection views
│   ├── templates/          # Data collection templates
│   └── static/             # Data collection static assets
├── healthcare_records/      # Healthcare records management
├── user/                    # Custom user model with moderator support
├── config/                  # Django settings and URL configuration
├── utils/                   # Utility functions and helpers
├── docs/                    # Documentation
└── templates/               # Global templates

```

## Core Domain Models

### Participant Management (base/)
- **Proband**: Study participant with CPR, demographics, status tracking
- **Relative**: Family members with relationship tracking
- **Address**: Participant addresses with time periods
- **Consent**: Consent tracking for different consent types
- **Note**: Time-stamped notes about participants
- **Cohort**: Study cohorts (e.g., COPSAC 2010, COPSAC 2020)
- **RecruitingCenter**: Recruiting locations
- **Site**: Study sites

### Data Collection (data/)
- **Dataset**: Defines data collection forms with JSON schemas and validation rules
- **VisitType**: Types of study visits with timing
- **Visit**: Individual participant visits
- **Examination**: Data collection instances during visits
- **Column**: Schema definitions for datasets (field definitions)
- **Cell**: Actual data values collected

### User Management (user/)
- **User**: Custom user model extending Django's AbstractUser with `is_moderator` field

## Key Technical Patterns

### 1. Historical Tracking
Models use `django-simple-history` for audit trails:
```python
from simple_history.models import HistoricalRecords

class MyModel(models.Model):
    # fields...
    history = HistoricalRecords(table_name="zz_myapp_mymodel")
```

### 2. Authentication & Permissions
- All views require `@login_required` decorator
- Some views use `@user_passes_test` for additional permission checks
- Class-based views use `LoginRequiredMixin`

### 3. AJAX/JSON APIs
Many views return JSON responses for dynamic frontend updates:
```python
@login_required
@require_GET
def my_view(request):
    return JsonResponse({"success": True, "data": data})
```

### 4. Form Validation
- Django forms with custom validation
- JSON schema validation for dynamic datasets
- Client-side validation using JavaScript

## Development Guidelines

### Code Style & Quality

**Python:**
- Follow PEP 8 with Black formatting (88 char line length)
- Use double quotes for strings
- Import ordering via `reorder-python-imports`
- Use `pyupgrade` for modern Python syntax (3.12+, but 3.14+ recommended)
- Type hints encouraged but not required
- Flake8 max line length: 120 characters

**JavaScript:**
- Use Prettier for formatting
- ES6+ syntax preferred
- Transpile with `./manage.py transpile` after changes

**Django-specific:**
- Use `django-upgrade` for modern Django patterns (4.2+ target)
- Migrations must be tested forward and backward
- Never commit migrations with data changes without review

### Pre-commit Hooks
The project uses extensive pre-commit hooks. Always run:
```bash
pre-commit install
```

Hooks include:
- black (Python formatting)
- flake8 (linting)
- eslint (JavaScript linting)
- pyupgrade (Python modernization)
- django-upgrade (Django best practices)
- Security checks (detect-private-key)
- Many more...

### Testing

**Run tests:**
```bash
python manage.py test
```

**Selenium tests available for integration testing:**
- Located in `base/tests/test_interaction.py`
- Test user interactions and workflows
- Require webdriver setup

**When writing tests:**
- Test data available via fixtures: `./manage.py loaddata test_database`
- Create unit tests for models and utilities
- Create integration tests for complex workflows
- Mock external dependencies

### Database Considerations

**Development:**
- SQLite for local development
- Database file: `db.sqlite3` (gitignored)

**Production:**
- MariaDB/MySQL
- Use `django-mysql` for MySQL-specific features
- Configuration via environment variables

**Migrations:**
- Always generate migrations: `./manage.py makemigrations`
- Review migrations before committing
- Test migrations on sample data
- Document any manual migration steps

### Security Best Practices

**This is a medical research platform handling sensitive data:**

1. **Never commit sensitive data:**
   - API keys
   - Database credentials
   - Patient information
   - CPR numbers (Danish social security)

2. **Authentication:**
   - All views must be protected with `@login_required`
   - Use appropriate permission checks
   - Implement proper user access controls

3. **Data validation:**
   - Sanitize all user input
   - Use Django forms for validation
   - Validate JSON schemas properly

4. **Environment variables:**
   - Use `python-dotenv` for local settings
   - Keep secrets in environment or `config/local_settings.py` (gitignored)

## Common Tasks

### Adding a New Model

1. Create model in appropriate app's `models/` directory
2. Add to app's `models/__init__.py`
3. Register in `admin.py` if needed
4. Create and run migrations
5. Add tests
6. Update documentation

### Adding a New View

1. Create view function/class in app's `views/` directory
2. Add URL pattern to app's `urls.py`
3. Create template in app's `templates/` directory
4. Add `@login_required` decorator
5. Add appropriate permission checks
6. Test thoroughly

### Modifying the Data Collection Schema

1. Update `Dataset` model or related schema definitions
2. Ensure backward compatibility with existing data
3. Write data migration if needed
4. Update validation logic
5. Test with existing data
6. Document schema changes

### Adding JavaScript Functionality

1. Add JS files to appropriate `static/` directory
2. Follow existing patterns for module organization
3. Run transpilation: `./manage.py transpile`
4. Update templates to include new scripts
5. Test across browsers

## Frontend Architecture

**Template Engine:** Django templates
**CSS Framework:** Bootstrap
**JavaScript:** Vanilla JS with some ES6+ features
**Build Process:** Custom transpilation via `./manage.py transpile`

**Key Frontend Patterns:**
- AJAX for dynamic updates
- Bootstrap modals for dialogs
- Custom form validation
- Responsive design for mobile/tablet support

## API Patterns

While not a REST API, the project uses JSON endpoints extensively:

**Pattern:**
```python
@login_required
@require_GET  # or @require_POST
def api_endpoint(request, param):
    try:
        # Process request
        data = {"success": True, "result": result}
    except Exception as e:
        data = {"success": False, "error": str(e)}
    return JsonResponse(data)
```

**Frontend consumption:**
```javascript
fetch('/api/endpoint/' + param)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Handle success
        } else {
            // Handle error
        }
    });
```

## Dependencies Management

**Python dependencies:** `requirements.txt`
- Keep versions pinned for stability
- Update regularly but test thoroughly
- Check security advisories

**JavaScript dependencies:** `package.json` + `pnpm-lock.yaml`
- Uses pnpm for package management
- Keep dependencies minimal

## Documentation

**Update documentation when:**
- Adding new features
- Changing APIs or interfaces
- Modifying data models
- Changing deployment procedures

**Documentation locations:**
- `README.md` - Overview and quick start
- `CONTRIBUTING.md` - Contribution guidelines
- `docs/` - Detailed documentation
  - `data_model.md` - Data model documentation
  - `deployment.md` - Deployment instructions
  - `development.md` - Development guide
  - `forms.md` - Form system documentation
  - `installation.md` - Installation guide

## Common Pitfalls to Avoid

1. **Don't bypass authentication:** Every view needs protection
2. **Don't ignore migrations:** Always create and test migrations
3. **Don't hard-code configuration:** Use settings and environment variables
4. **Don't skip pre-commit hooks:** They catch issues early
5. **Don't modify historical data directly:** Use proper audit trail patterns
6. **Don't expose CPR or sensitive data:** Be extra careful with patient information
7. **Don't break backward compatibility:** Many studies have years of data
8. **Don't skip testing:** Medical research data is critical

## Debugging Tips

1. **Django Debug Toolbar:** Available in development mode
2. **Logging:** Use Python's logging module, already configured
3. **Django shell:** `./manage.py shell` for interactive debugging
4. **Database inspection:** `./manage.py dbshell` for direct DB access
5. **Print debugging:** Use `print()` or `logger.debug()` liberally during development

## Performance Considerations

1. **Database queries:**
   - Use `select_related()` and `prefetch_related()` for foreign keys
   - Add database indexes for frequently queried fields
   - Monitor query counts with Django Debug Toolbar

2. **Large datasets:**
   - Paginate results
   - Use iterator() for bulk operations
   - Consider background tasks for long-running operations

3. **Caching:**
   - Cache expensive computations
   - Use Django's caching framework
   - Be careful with cached sensitive data

## Getting Help

1. **Documentation:** Check `docs/` directory first
2. **Code examples:** Look for similar existing patterns in codebase
3. **Issue tracker:** GitHub issues for bugs and feature requests
4. **Contributors:** See `CONTRIBUTORS.md` for contact information
5. **Main contact:** Johannes Wilm <mail@johanneswilm.org>

## Contributing

See `CONTRIBUTING.md` for detailed contribution guidelines.

**Quick checklist before submitting changes:**
- [ ] Code follows style guidelines (passes pre-commit hooks)
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Migrations created and tested
- [ ] No sensitive data committed
- [ ] Security implications considered
- [ ] Backward compatibility maintained
- [ ] PR description explains changes clearly

## Understanding the Research Context

This platform supports longitudinal cohort studies, meaning:
- **Data spans years or decades:** Participants are followed over long periods
- **Data integrity is critical:** Research conclusions depend on data accuracy
- **Compliance matters:** Medical research has strict ethical and legal requirements
- **Usability for non-technical users:** Nurses and researchers use this daily
- **Flexibility needed:** Each study may have different requirements

When making changes, consider:
- Will this work for a study with 1,000+ participants?
- Will this maintain data integrity over 10+ years?
- Can a nurse use this without technical training?
- Does this protect participant privacy?
- Is this change backward compatible with existing data?

## License Compliance

The project uses LGPL, which means:
- **Core library must remain open source**
- **Modifications must be shared back**
- **Can be used in proprietary systems**
- **Link to library, don't embed changes without sharing**

When contributing:
- Your contributions will be under LGPL
- Don't include incompatible licensed code
- Acknowledge third-party code properly
- Maintain license headers where present

---

**Last Updated:** 2025
**Maintained by:** Cohort Study Kit Contributors
**For AI Agents:** This document should help you understand the project structure, conventions, and best practices. Always prioritize data integrity, security, and user privacy when working on this medical research platform.
