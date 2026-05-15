from rest_framework import serializers
from .models import CartItem, Order, OrderItem
from apps.products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'title', 'price', 'quantity', 'image']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_method',
            'items',
            'shipping_name', 'shipping_phone', 
            'shipping_house_no', 'shipping_street', 'shipping_city', 'shipping_state', 'shipping_pincode',
            'subtotal', 'shipping_cost', 'tax', 'total',
            'created_at'
        ]


class PlaceOrderSerializer(serializers.Serializer):
    shipping_name = serializers.CharField()
    shipping_phone = serializers.CharField()
    shipping_house_no = serializers.CharField()
    shipping_street = serializers.CharField()
    shipping_city = serializers.CharField()
    shipping_state = serializers.CharField()
    shipping_pincode = serializers.CharField()
    payment_method = serializers.CharField(default='Cash on Delivery')
    is_buy_now = serializers.BooleanField(default=False)
    buy_now_product_id = serializers.IntegerField(required=False)
    buy_now_quantity = serializers.IntegerField(required=False, default=1)