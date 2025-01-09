bind = "127.0.0.1:8000"
workers = 4

# Workers restart when code changed
reload = True

# Write access and error info
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
# Redirect stdout/stderr to log file
capture_output = True
PYTHONUNBUFFERED = False
