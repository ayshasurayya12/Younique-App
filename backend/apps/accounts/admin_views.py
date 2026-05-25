from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.db.models import Q
from .serializers import UserSerializer

from rest_framework.pagination import PageNumberPagination

User = get_user_model()

class UserPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 50

class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get('search', '')
        users = User.objects.all().order_by('-date_joined')

        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search)
            )

        paginator = UserPagination()
        paginated_users = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(paginated_users, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if 'is_blocked' in request.data:
            user.is_blocked = request.data['is_blocked']
        if 'is_staff' in request.data:
            user.is_staff = request.data['is_staff']

        user.save()
        return Response(UserSerializer(user).data)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if user == request.user:
            return Response(
                {'error': 'You cannot delete your own account'},
                status=400
            )

        if user.is_staff:
            return Response(
                {'error': 'Cannot delete admin accounts'},
                status=400
            )

        username = user.username
        user.delete()
        return Response({'message': f'User {username} deleted successfully'})