from django.apps import apps

if apps.ready:
    from . import signals  # noqa: F401
