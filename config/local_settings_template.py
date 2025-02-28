SECRET_KEY = "something-very-random"
DEBUG = False

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "root": {"level": "INFO", "handlers": ["file"]},
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": "/var/log/django.log",
            "formatter": "app",
        },
    },
    "loggers": {
        "django": {"handlers": ["file"], "level": "INFO", "propagate": True},
    },
    "formatters": {
        "app": {
            "format": (
                "%(asctime)s [%(levelname)-8s] " "(%(module)s.%(funcName)s) %(message)s"
            ),
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
}


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "cohort_study_kit",
        "USER": "user",
        "PASSWORD": "password",
        "HOST": "localhost",
        "PORT": 3306,
        "OPTIONS": {"charset": "utf8mb4"},
    },
}

COUNTRY = "DK"  # Main country
