from django.urls import path, include
from rest_framework.routers import DefaultRouter

from dumps.views import CrashDumpViewSet

router = DefaultRouter()
router.register(r'dumps', CrashDumpViewSet, basename='crashdump')

urlpatterns = [
    path('api/', include(router.urls)),
]
