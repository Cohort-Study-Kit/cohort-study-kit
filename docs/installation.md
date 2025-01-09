# Installation Guide

## Prerequisites

- Python >=3.12 with venv support
- Node.js and npm for JavaScript transpilation
- MariaDB (for production) or SQLite (for development)

### Ubuntu (Noble+)

```bash
sudo apt install python3.12 python3.12-venv python3.12-dev libmysqlclient-dev build-essential npm nodejs -y
```

## Development Environment Setup

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

## Production Setup

1. Copy production settings template:
```bash
cp config/local_settings_template.py config/local_settings.py
```

2. Edit `local_settings.py` to configure:
   - Database connection
   - Secret key
   - Allowed hosts
   - Debug mode (set to False)

3. Set up gunicorn:
```bash
cd /usr/local/bin
ln -s /web_gui/copsac-web/deploy deploy
cp utils/gunicorn/django-gunicorn.service /etc/systemd/system/
sudo systemctl enable django-gunicorn
```
