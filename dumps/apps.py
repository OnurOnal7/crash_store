import os
from django.apps import AppConfig
from django.conf import settings

class DumpsConfig(AppConfig):
    name = 'dumps'
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):
        os.makedirs(settings.DUMPS_BASE_DIR, exist_ok=True)
