from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from crash_store import settings
from .serializers import AdminUserSerializer, EmailTokenObtainPairSerializer, ClientTokenRequestSerializer

User = get_user_model()

class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        return AdminUserSerializer
    
class ClientTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @staticmethod
    def post(request):
        serializer = ClientTokenRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if serializer.validated_data["client_secret"] != settings.MACHINE_CLIENT_SECRET:
            return Response({"detail": "Invalid client secret."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            machine_user = User.objects.get(email=settings.MACHINE_CLIENT_EMAIL)
        except User.DoesNotExist:
            return Response({"detail": "Machine user not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        refresh = RefreshToken.for_user(machine_user)
        access = refresh.access_token
        access.set_exp(lifetime=timedelta(minutes=15))

        return Response({"access": str(access)}, status=status.HTTP_200_OK)

        


    
