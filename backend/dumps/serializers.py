from rest_framework import serializers
from .models import CrashDump

class CrashDumpSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrashDump
        fields = ['id', 'original_name', 'stored_name', 'time', 'label']
        read_only_fields = ['original_name', 'stored_name', 'time']
        extra_kwargs = {
            'label': {'required': False, 'allow_null': True, 'allow_blank': True}
        }
        
