from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileView, AddressListCreateView, VerifyEmailView,ForgotPasswordView, ResetPasswordView
from .views import FirebaseOTPLoginView
from .admin_views import AdminUserListView, AdminUserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('addresses/', AddressListCreateView.as_view(), name='addresses'),
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('otp-login/', FirebaseOTPLoginView.as_view(), name='otp-login'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]