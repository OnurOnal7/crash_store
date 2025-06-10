from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from dumps.views import CrashDumpViewSet
from accounts.views import UserViewSet, LoginView, RefreshView, ClientTokenView

router = DefaultRouter()

router.register(r'dumps', CrashDumpViewSet, basename='crashdump')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path("api/auth/login/", LoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", RefreshView.as_view(), name="token_refresh"),
    path("api/auth/client-token/", ClientTokenView.as_view(), name="client_token")

]
