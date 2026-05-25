from rest_framework import serializers
from .models import Category, Product, WishlistItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'category', 'image', 'stock', 'is_featured', 'in_stock']


class OriginalPriceSerializer(serializers.Serializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    original_price = OriginalPriceSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'title', 'description', 'price', 'category', 'image', 'stock', 'is_featured', 'in_stock', 'created_at', 'original_price']


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'user_id', 'user_name', 'user_email', 'product', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username