# Deployment Guide

## Production Setup

1. Set up database (MariaDB recommended):
```sql
CREATE DATABASE cohort_study_kit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cohort_study_kit'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON cohort_study_kit.* TO 'cohort_study_kit'@'localhost';
FLUSH PRIVILEGES;
```

2. Configure settings:
- Copy `config/local_settings_template.py` to `config/local_settings.py`
- Update database settings
- Set SECRET_KEY
- Configure ALLOWED_HOSTS
- Set DEBUG = False

3. Set up gunicorn:
The project includes Gunicorn configuration files in `utils/gunicorn/`:
- `django-gunicorn.service`: Systemd service configuration
- `gunicorn.conf.py`: Gunicorn worker and logging configuration

Default configuration:
- 4 worker processes
- Binds to 127.0.0.1:8000
- Logs to /var/log/gunicorn/

To install:
```bash
cp utils/gunicorn/django-gunicorn.service /etc/systemd/system/
systemctl enable django-gunicorn
systemctl start django-gunicorn
```

4. Set up nginx:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Updates

The project includes a deployment script (`utils/deploy`) that handles:
- Pulling latest code
- Running migrations
- Collecting static files
- Restarting Gunicorn

Usage:
```bash
deploy          # Deploy with migrations
deploy -n       # Deploy without running migrations
```

To deploy updates manually, do instead:

1. Pull latest code

2. Transpile:
```bash
./manage.py transpile
```

3. Run migrations:
```bash
./manage.py migrate
```

4. Collect static files:
```bash
./manage.py collectstatic
```

5. Restart gunicorn:
```bash
systemctl restart django-gunicorn
```

## Backup

Regular backups should include:
1. Database dump
2. Media files
3. Configuration files

Example basic backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
mysqldump cohort_study_kit > backup_$DATE.sql
tar -czf media_$DATE.tar.gz media/
```

A more robust solution is to backup automatically daily. Here's a simplified version of the backup strategy you can adapt:

```python
#!/usr/bin/env python3
import datetime
import subprocess
import os

BACKUP_DIR = "/path/to/your/backup/directory"
MAX_BACKUPS = 7  # Keep 7 days of backups

def create_backup():
    # Create backup filename with timestamp
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d')
    backup_file = f"{BACKUP_DIR}/{timestamp}.sql"

    # Create database backup
    with open(backup_file, "w") as out:
        subprocess.run(
            ["mysqldump", "--all-databases", "--add-drop-database"],
            stdout=out,
        )

    # Remove old backups
    existing_backups = sorted(os.listdir(BACKUP_DIR))
    while len(existing_backups) > MAX_BACKUPS:
        os.remove(f"{BACKUP_DIR}/{existing_backups[0]}")
        existing_backups.pop(0)

if __name__ == "__main__":
    create_backup()
```

Set up a cron job to run your backup script daily:
```bash
0 1 * * * /path/to/backup/script.py
```

## Monitoring

Set up monitoring for:
- Server health
- Database performance
- Application errors
- User activity

## Security

- Keep system updated
- Use SSL/TLS
- Regular security audits
- Monitor access logs
