# Cohort Study Kit

Cohort Study Kit is an open-source platform for managing longitudinal cohort studies. It provides a complete solution for collecting, storing, and managing research data from study participants over time.

Originally developed for the COPSAC (Copenhagen Prospective Studies on Asthma in Childhood) project, this software is designed to be adaptable for any research project requiring systematic data collection and management.

## Key Features

- **Form Builder**: Create custom data collection forms with advanced validation rules
- **Visit Management**: Schedule and track participant visits
- **Participant Records**: Comprehensive participant management including:
  - Contact information and demographics
  - Family relationships
  - Medical history
  - Visit records
  - Custom data points
- **Data Security**: Built-in security features to protect sensitive research data
- **Export Capabilities**: Easy data export for analysis
- **Multi-user Support**: Different access levels for researchers, nurses, and administrators

## Technology Stack

- Django framework for robust backend functionality
- MariaDB (production) / SQLite (development) for data storage
- Modern JavaScript for responsive frontend
- Bootstrap for clean, professional UI

## Getting Started

### Prerequisites

- Python >=3.12 with venv support (3.14+ recommended)

On Ubuntu (Noble+), execute:

```bash
# For Python 3.12
sudo apt install python3.12 python3.12-venv python3.12-dev libmysqlclient-dev build-essential npm nodejs -y

# Or for Python 3.14 (if available)
sudo apt install python3.14 python3.14-venv python3.14-dev libmysqlclient-dev build-essential npm nodejs -y
```

### Quick Start

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

3. Initialize database:
```bash
./manage.py migrate
./manage.py loaddata test_database
```

4. Create admin user:
```bash
./manage.py createsuperuser
```

5. Run server:
```bash
./manage.py runserver
```


## Use Cases

Cohort Study Kit is ideal for:

- Medical research studies
- Longitudinal cohort studies
- Clinical trials
- Any research requiring systematic data collection from participants over time

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- [Documentation](docs/)
- [Issue Tracker](https://github.com/Cohort-Study-Kit/cohort-study-kit/issues)

## License

This project is licensed under the GNU Lesser General Public License (LGPL) - see the [LICENSE](LICENSE) file for details.

The LGPL license was chosen because:
- It ensures the core library remains open source while allowing it to be used in any project, including proprietary ones
- Modifications to the library itself must be shared back with the community
- Research organizations can integrate it into their systems without being forced to open-source their entire codebase
- It promotes collaboration while protecting both open-source values and practical usability in research environments

## Acknowledgments

Originally developed for COPSAC (Copenhagen Prospective Studies on Asthma in Childhood) and released as open source to benefit the wider research community.
