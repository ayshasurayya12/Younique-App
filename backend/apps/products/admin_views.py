from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils.text import slugify
from .models import Product, Category
from .serializers import ProductDetailSerializer, ProductListSerializer, CategorySerializer

class AdminProductPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 50

def clean_image_path(image_val):
    if not image_val or not isinstance(image_val, str):
        return image_val
    if '://' in image_val:
        parts = image_val.split('://', 1)[1].split('/', 1)
        if len(parts) > 1:
            image_val = '/' + parts[1]
    while image_val.startswith('/media/') or image_val.startswith('media/'):
        if image_val.startswith('/media/'):
            image_val = image_val[len('/media/'):]
        else:
            image_val = image_val[len('media/'):]
    return image_val.lstrip('/')


class AdminProductListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = Product.objects.all().order_by('-created_at')
        
        # Search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(category__name__icontains=search)
            )
        
        # Sort
        sort_option = request.query_params.get('sort')
        if sort_option == 'priceLow':
            queryset = queryset.order_by('price')
        elif sort_option == 'priceHigh':
            queryset = queryset.order_by('-price')
        elif sort_option == 'AtoZ':
            queryset = queryset.order_by('title')
        elif sort_option == 'ZtoA':
            queryset = queryset.order_by('-title')
        elif sort_option == 'featured':
            queryset = queryset.order_by('-is_featured', '-created_at')
        elif sort_option == 'stock':
            queryset = queryset.order_by('-stock')
            
        paginator = AdminProductPagination()
        paginated = paginator.paginate_queryset(queryset, request)
        serializer = ProductListSerializer(paginated, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        data = request.data

        # get or create category
        cat_name = data.get('category', '').strip()
        if not cat_name:
            return Response({'error': 'Category is required'}, status=400)

        category, _ = Category.objects.get_or_create(
            name=cat_name,
            defaults={'slug': slugify(cat_name)}
        )

        try:
            product = Product.objects.create(
                title=data.get('title'),
                description=data.get('description', ''),
                price=data.get('price'),
                category=category,
                stock=data.get('stock', 0),
                is_featured=data.get('is_featured', False),
                image=clean_image_path(data.get('image', '')),
            )
            return Response(ProductDetailSerializer(product).data, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class AdminProductDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        return Response(ProductDetailSerializer(product).data)

    def patch(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        data = request.data

        if 'title' in data:
            product.title = data['title']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'stock' in data:
            product.stock = data['stock']
        if 'is_featured' in data:
            product.is_featured = data['is_featured']
        if 'image' in data:
            product.image = clean_image_path(data['image'])

        if 'category' in data:
            cat_name = data['category'].strip()
            category, _ = Category.objects.get_or_create(
                name=cat_name,
                defaults={'slug': slugify(cat_name)}
            )
            product.category = category

        product.save()
        return Response(ProductDetailSerializer(product).data)

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        product.delete()
        return Response({'message': 'Product deleted'}, status=200)


class AdminProductImageUpload(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        if 'image' not in request.FILES:
            return Response({'error': 'No image provided'}, status=400)

        product.image = request.FILES['image']
        product.save()

        return Response({'image': str(product.image)}, status=200)

from .models import WishlistItem
from .serializers import WishlistItemSerializer

class AdminWishlistListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = WishlistItem.objects.all().order_by('-created_at')
        
        # Search by username, user email, or product title
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(product__title__icontains=search)
            )

        paginator = AdminProductPagination()
        paginated = paginator.paginate_queryset(queryset, request)
        serializer = WishlistItemSerializer(paginated, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

class AdminWishlistDetailView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            item = WishlistItem.objects.get(pk=pk)
            item.delete()
            return Response({'message': 'Wishlist item deleted successfully'})
        except WishlistItem.DoesNotExist:
            return Response({'error': 'Wishlist item not found'}, status=404)