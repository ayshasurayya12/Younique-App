from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import secrets
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
from firebase_admin import auth as firebase_auth

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, AddressSerializer
from .models import Address

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()

            token = secrets.token_urlsafe(32)
            cache.set(f'email_verify_{token}', user.id, timeout=86400)

            verify_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
            send_mail(
                subject='Verify your email - Younique',
                message=f'Hi {user.first_name},\n\nClick the link to verify your email:\n{verify_url}\n\nThis link expires in 24 hours.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response(
                {'message': 'Registration successful. Please check your email to verify your account.'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = User.objects.filter(username=username).first() or \
                   User.objects.filter(email=username).first()

            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            if not user.check_password(password):
                return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_active:
                return Response({'error': 'Please verify your email before logging in.'}, status=status.HTTP_403_FORBIDDEN)

            if user.is_blocked:
                return Response({'error': 'Your account has been blocked'}, status=status.HTTP_403_FORBIDDEN)

            tokens = get_tokens_for_user(user)
            return Response({
                **tokens,
                'user': UserSerializer(user).data
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'verify'

    def get(self, request, token):
        user_id = cache.get(f'email_verify_{token}')

        if not user_id:
            return Response(
                {'error': 'Verification link is invalid or has expired.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            if not user.is_active:
                user.is_active = True
                user.is_email_verified = True
                user.save()
            
            # We can keep the token for a bit longer to handle double-clicks/React StrictMode
            # It will expire automatically based on the timeout set in RegisterView
            return Response({'message': 'Email verified successfully. You can now login.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        

class FirebaseOTPLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        id_token = request.data.get('idToken')

        if not id_token:
            return Response(
                {'error': 'Firebase token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # verify the token with Firebase
            decoded_token = firebase_auth.verify_id_token(id_token)
            phone = decoded_token.get('phone_number')

            if not phone:
                return Response(
                    {'error': 'No phone number in token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # get or create user with this phone number
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={
                    'username': f'user_{phone[-4:]}_{User.objects.count()}',
                    'is_active': True,
                }
            )

            if user.is_blocked:
                return Response(
                    {'error': 'Your account has been blocked'}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # return JWT tokens same as normal login
            tokens = get_tokens_for_user(user)
            return Response({
                **tokens,
                'user': UserSerializer(user).data,
                'is_new_user': created,
            })

        except firebase_auth.ExpiredIdTokenError:
            return Response(
                {'error': 'OTP expired. Please try again.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except firebase_auth.InvalidIdTokenError:
            return Response(
                {'error': 'Invalid OTP. Please try again.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )