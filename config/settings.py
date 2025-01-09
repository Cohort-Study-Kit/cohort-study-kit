import os
import sys
from pathlib import Path


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = BASE_DIR / "config"

SETTINGS_PATHS = [
    os.path.dirname(__file__),
]

SECRET_KEY = "something-very-random"

DEBUG = True

ALLOWED_HOSTS = ["*"]

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
]

THIRD_PARTY_APPS = [
    "crispy_forms",
    "crispy_bootstrap5",
    "django_extensions",
    "django_jsonform",
    "django_json_widget",
    "django_mysql",
    "simple_history",
    "npm_mjs",
]

LOCAL_APPS = [
    "healthcare_records",
    "data",
]

# Application definition
INSTALLED_APPS = [
    "base",
    "user",
    *DJANGO_APPS,
    *THIRD_PARTY_APPS,
    *LOCAL_APPS,
]

AUTH_USER_MODEL = "user.User"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": "db.sqlite3",
    },
}

MIDDLEWARE = [
    "simple_history.middleware.HistoryRequestMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [PROJECT_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Europe/Copenhagen"

USE_I18N = True


USE_TZ = True

SITE_ID = 1

# Log out redirect
LOGOUT_REDIRECT_URL = "/accounts/login/"
LOGIN_REDIRECT_URL = "/"

# CSRF trusted origin, required since django 4.0
CSRF_TRUSTED_ORIGINS = [
    "http://192.168.1.48",
    "http://192.168.1.47",
    "http://192.168.1.46",
    "http://192.168.1.45",
]

STATIC_URL = "/static/"
STATICFILES_DIRS = [
    PROJECT_DIR / "static",
    PROJECT_DIR / "static-transpile",
]
STATIC_ROOT = BASE_DIR / "static"


# Translations in one location
LOCALE_PATHS = [PROJECT_DIR / "locale"]

# Allauth configuration
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_SIGNUP_PASSWORD_ENTER_TWICE = False
ACCOUNT_USERNAME_REQUIRED = False

# Crispy forms
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

# Django-extensions package config
SHELL_PLUS_PRINT_SQL = False
SHELL_PLUS_PRINT_SQL_TRUNCATE = None

TESTING = len(sys.argv) > 1 and sys.argv[1] == "test"

if True is False:
    INSTALLED_APPS += [
        "django_browser_reload",
        "debug_toolbar",
    ]
    MIDDLEWARE += [
        "debug_toolbar.middleware.DebugToolbarMiddleware",
        "django_browser_reload.middleware.BrowserReloadMiddleware",
    ]
    # Always show DDT in development for any IP, not just 127.0.0.1 or
    # settings.INTERNAL_IPS. This is useful in a docker setup where the
    # requesting IP isn't static.
    DEBUG_TOOLBAR_CONFIG = {
        "SHOW_TOOLBAR_CALLBACK": lambda _x: DEBUG,
    }

SURVEYS_GRID_HEIGHT = 700
SURVEYS_GRID_ROWS = 100
SURVEYS_GRID_WIDTH = 1250
SURVEYS_GRID_COLUMNS = 100
SURVEYS_GRID_ROW_HEIGHT = SURVEYS_GRID_HEIGHT // SURVEYS_GRID_ROWS
SURVEYS_GRID_COLUMN_WIDTH = SURVEYS_GRID_WIDTH // SURVEYS_GRID_COLUMNS


# Misc.
SHELL_PLUS_PRINT_SQL_TRUNCATE = None
DJANGO_MYSQL_REWRITE_QUERIES = True
DATE_FORMAT = "d-m-Y"

LOGGING = {
    "version": 1,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}

try:
    from .local_settings import *  # noqa: F401, F403
except ImportError:
    pass
