from rest_framework import serializers
from .models import Offer
from apps.products.serializers import ProductListSerializer, CategorySerializer


class OfferSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    is_expired = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'description', 'discount_type', 'discount_value',
            'target', 'product', 'category',
            'product_detail', 'category_detail',
            'start_date', 'end_date', 'is_active',
            'is_expired', 'is_upcoming', 'created_at',
        ]

    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.end_date < timezone.now()

    def get_is_upcoming(self, obj):
        from django.utils import timezone
        return obj.start_date > timezone.now()