from django.db import models

class CrashDump(models.Model):
    original_name = models.CharField(max_length=64)
    stored_name = models.CharField(max_length=36, unique=True)
    time = models.DateTimeField(auto_now_add=True)
    labels = models.JSONField(default=list)
    
    def __str__(self):
        return f"#{self.id} – {self.original_name} @ {self.time:%Y-%m-%d %H:%M:%S}"
