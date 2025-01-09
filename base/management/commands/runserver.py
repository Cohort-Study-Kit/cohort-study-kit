import os
import time

from django.conf import settings
from django.contrib.staticfiles.handlers import StaticFilesHandler
from django.core.management import call_command
from django.core.management.commands.runserver import Command as RunserverCommand
from django.core.management.commands.runserver import get_internal_wsgi_application
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


class JSFileHandler(FileSystemEventHandler):
    def __init__(self, command_instance):
        self.command_instance = command_instance
        self.last_transpile = 0
        self.watched_extensions = (".js", ".mjs", ".json5")
        self.last_modified_times = {}

    def on_any_event(self, event):
        if event.event_type in ["created", "modified", "moved"]:
            if event.src_path.endswith(self.watched_extensions):
                if not self._should_ignore(event.src_path):
                    self._handle_change(event.src_path)

    def _should_ignore(self, path):
        ignore_list = ["node_modules", ".git"]
        return any(ignore_item in path for ignore_item in ignore_list)

    def _handle_change(self, path):
        current_time = time.time()
        try:
            mtime = os.path.getmtime(path)
        except OSError:
            return

        if path in self.last_modified_times:
            if mtime == self.last_modified_times[path]:
                return

        self.last_modified_times[path] = mtime

        if current_time - self.last_transpile > 30:
            self.command_instance.stdout.write(
                "JavaScript or related file changed. Transpiling...",
            )
            call_command("transpile")
            self.last_transpile = current_time


class Command(RunserverCommand):
    def add_arguments(self, parser):
        super().add_arguments(parser)

    def get_handler(self, *args, **options):
        handler = get_internal_wsgi_application()
        if settings.DEBUG:
            handler = StaticFilesHandler(handler)
        return handler

    def inner_run(self, *args, **options):
        # Initial transpile on startup
        call_command("transpile")

        if settings.DEBUG:
            js_handler = JSFileHandler(self)
            observer = Observer()
            observer.schedule(js_handler, path=settings.BASE_DIR, recursive=True)
            observer.start()
        else:
            observer = None

        try:
            super().inner_run(*args, **options)
        finally:
            if settings.DEBUG and observer:
                observer.stop()
                observer.join()
