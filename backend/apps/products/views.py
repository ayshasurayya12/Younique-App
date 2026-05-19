from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer


class ProductPagination(PageNumberPagination):
    page_size = 8  # 8 products per page
    page_size_query_param = 'page_size'
    max_page_size = 50


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Product.objects.all()
        search = request.query_params.get('search')
        category = request.query_params.get('category')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        if category:
            queryset = queryset.filter(category__name__icontains=category)

        paginator = ProductPagination()
        paginated = paginator.paginate_queryset(queryset, request)
        serializer = ProductListSerializer(paginated, many=True)

        return paginator.get_paginated_response(serializer.data)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        serializer = ProductDetailSerializer(product)
        return Response(serializer.data)


class FeaturedProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(is_featured=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

from rest_framework.permissions import IsAuthenticated
from .models import WishlistItem
from .serializers import WishlistItemSerializer

class UserWishlistListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).order_by('-created_at')
        serializer = WishlistItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
        if not created:
            return Response({'message': 'Product already in wishlist'}, status=200)

        serializer = WishlistItemSerializer(item)
        return Response(serializer.data, status=201)

class UserWishlistDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            # pk is product ID
            item = WishlistItem.objects.get(user=request.user, product_id=pk)
            item.delete()
            return Response({'message': 'Product removed from wishlist'})
        except WishlistItem.DoesNotExist:
            return Response({'error': 'Wishlist item not found'}, status=404)