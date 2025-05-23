import os
import uuid
from django.db import transaction
from django.http import Http404, FileResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from dumps.models import CrashDump
from dumps.serializers import CrashDumpSerializer


class CrashDumpViewSet(viewsets.ModelViewSet):
    queryset = CrashDump.objects.all().order_by('-time')
    serializer_class = CrashDumpSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    # Override create method to handle file uploads
    def create(self, request, *args, **kwargs):
        dump_file = request.FILES.get('file')
        if not dump_file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        original_name = dump_file.name
        stored_name = uuid.uuid4().hex
        dest = self._build_path(stored_name)
        
        try:
            self._save_file(dump_file, dest)
            with transaction.atomic():
                dump = CrashDump.objects.create(original_name=original_name, stored_name=stored_name)
        except Exception:
            if os.path.isfile(dest):
                os.remove(dest)
            raise
        
        serializer = self.get_serializer(dump)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Override update method
    def update(self, request, *args, **kwargs):
        return self._update_file_and_metadata(request, partial=False, *args, **kwargs)
    
    # Override partial update method
    def partial_update(self, request, *args, **kwargs):
        return self._update_file_and_metadata(request, partial=True, *args, **kwargs)
    
    # Override destroy method
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        file_path = self._build_path(instance.stored_name)
        data = self.get_serializer(instance).data
        
        with transaction.atomic():
            self.perform_destroy(instance)
            transaction.on_commit(lambda: self._delete_file(file_path))
            
        return Response(data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        instance = self.get_object()
        file_path = self._build_path(instance.stored_name)
        
        if not os.path.isfile(file_path):
            raise Http404("Dump file not found.")
        
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=instance.original_name)
    
    # Private helper to handle update for PUT/PATCH
    def _update_file_and_metadata(self, request, partial, *args, **kwargs):
        instance = self.get_object()
        dump_file = request.FILES.get('file')
        
        old_path = new_name = None
        
        if dump_file:
            old_path = self._build_path(instance.stored_name)
            new_name = uuid.uuid4().hex
            new_dest = self._build_path(new_name)
            try:
                self._save_file(dump_file, new_dest)
            except Exception:
                if os.path.isfile(new_dest):
                    os.remove(new_dest)
                raise
            
        with transaction.atomic():
            # Original name passed in PATCH
            if 'original_name' in request.data:
                instance.original_name = request.data['original_name']
            # Full PUT file replace
            elif dump_file and not partial:
                instance.original_name = dump_file.name
            
            # Always updated hashed name if new file is passed
            if dump_file:
                instance.stored_name = new_name
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            if dump_file:
                transaction.on_commit(lambda: self._delete_file(old_path))
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @staticmethod
    def _build_path(stored_name: str) -> str:
        a, b = stored_name[0], stored_name[1]
        return os.path.join(settings.DUMPS_BASE_DIR, a, b, stored_name)
    
    @staticmethod
    def _save_file(dump_file, dest: str) -> None:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'wb') as out:
            for chunk in dump_file.chunks():
                out.write(chunk)
                
    @staticmethod
    def _delete_file(path: str) -> None:
        if os.path.isfile(path):
            os.remove(path)
