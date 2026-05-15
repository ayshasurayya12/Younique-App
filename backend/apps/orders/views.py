from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.products.models import Product
from .models import CartItem, Order, OrderItem
from .serializers import (
    CartItemSerializer, AddToCartSerializer,
    OrderSerializer, PlaceOrderSerializer
)


# ─── CART VIEWS ───────────────────────────────────────────────

class CartListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart_items = CartItem.objects.filter(user=request.user)
        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            quantity = serializer.validated_data['quantity']

            try:
                product = Product.objects.get(pk=product_id)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

            if product.stock < quantity:
                return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)

            cart_item, created = CartItem.objects.get_or_create(
                user=request.user,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                new_quantity = cart_item.quantity + quantity
                if product.stock < new_quantity:
                    return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)
                cart_item.quantity = new_quantity
                cart_item.save()

            return Response(CartItemSerializer(cart_item).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            cart_item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')

        if quantity is None:
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)

        if int(quantity) <= 0:
            cart_item.delete()
            return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)

        if cart_item.product.stock < int(quantity):
            return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()
        return Response(CartItemSerializer(cart_item).data)


class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            cart_item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        return Response({'message': 'Item removed'}, status=status.HTTP_200_OK)


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)


class CartCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart_items = CartItem.objects.filter(user=request.user)
        total = sum(item.quantity for item in cart_items)
        return Response({'count': total})


# ─── ORDER VIEWS ──────────────────────────────────────────────

class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        is_buy_now = data.get('is_buy_now', False)

        # get items — either buy now or from cart
        if is_buy_now:
            product_id = data.get('buy_now_product_id')
            quantity = data.get('buy_now_quantity', 1)

            try:
                product = Product.objects.get(pk=product_id)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

            if product.stock < quantity:
                return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)

            items_to_order = [{'product': product, 'quantity': quantity}]

        else:
            cart_items = CartItem.objects.filter(user=request.user)
            if not cart_items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            # verify stock for all items first
            for cart_item in cart_items:
                if cart_item.product.stock < cart_item.quantity:
                    return Response(
                        {'error': f'Not enough stock for {cart_item.product.title}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            items_to_order = [
                {'product': ci.product, 'quantity': ci.quantity}
                for ci in cart_items
            ]

        # calculate totals
        subtotal = sum(item['product'].price * item['quantity'] for item in items_to_order)
        shipping_cost = 0
        tax = 0
        total = subtotal + shipping_cost + tax

        # generate order number
        timestamp = int(timezone.now().timestamp() * 1000)
        order_number = f"ORD-{timestamp}"

        # create order
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            status=Order.Status.PROCESSING,
            payment_method=data.get('payment_method', 'Cash on Delivery'),
            shipping_name=data['shipping_name'],
            shipping_phone=data['shipping_phone'],
            shipping_house_no=data['shipping_house_no'],
            shipping_street=data['shipping_street'],
            shipping_city=data['shipping_city'],
            shipping_state=data['shipping_state'],
            shipping_pincode=data['shipping_pincode'],
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
        )

        # create order items + deduct stock
        for item in items_to_order:
            product = item['product']
            quantity = item['quantity']

            OrderItem.objects.create(
                order=order,
                product=product,
                title=product.title,
                price=product.price,
                quantity=quantity,
                image=str(product.image),
            )

            product.stock -= quantity
            product.save()

        # clear cart (only if not buy now)
        if not is_buy_now:
            CartItem.objects.filter(user=request.user).delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status__iexact=status_filter)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PROCESSING:
            return Response(
                {'error': 'Only processing orders can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # restore stock
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save()

        order.status = Order.Status.CANCELLED
        order.save()

        return Response(OrderSerializer(order).data)


class DeleteOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.CANCELLED:
            return Response(
                {'error': 'Only cancelled orders can be deleted'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.delete()
        return Response({'message': 'Order deleted'}, status=status.HTTP_200_OK)