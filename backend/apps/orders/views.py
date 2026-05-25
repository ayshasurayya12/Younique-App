from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.products.models import Product
from .models import CartItem, Order, OrderItem
from apps.notifications.utils import send_notification, send_admin_notification
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
    throttle_scope = 'checkout'

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

        # determine initial status and handle Razorpay order creation
        payment_method = data.get('payment_method', 'Cash on Delivery')
        initial_status = Order.Status.PROCESSING
        razorpay_order_id = None

        if payment_method == 'Razorpay':
            initial_status = Order.Status.PAYMENT_PENDING
            try:
                import razorpay
                from django.conf import settings
                
                razorpay_client = razorpay.Client(
                    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                )
                
                # Razorpay amount is in paise (1 INR = 100 paise)
                razorpay_amount = int(float(total) * 100)
                
                razorpay_order = razorpay_client.order.create({
                    "amount": razorpay_amount,
                    "currency": "INR",
                    "receipt": order_number,
                    "payment_capture": 1
                })
                razorpay_order_id = razorpay_order.get('id')
            except Exception as e:
                return Response(
                    {'error': f'Failed to initiate payment with Razorpay: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # create order
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            status=initial_status,
            payment_method=payment_method,
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
            razorpay_order_id=razorpay_order_id
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

        response_data = OrderSerializer(order).data
        if payment_method == 'Razorpay':
            from django.conf import settings
            response_data['razorpay_key_id'] = settings.RAZORPAY_KEY_ID
        else:
            # For COD or other methods, order is successfully placed immediately
            send_notification(
                recipient=request.user,
                title="Order Placed Successfully",
                message=f"Your order #{order_number} has been placed successfully.",
                notification_type="order_placed",
                related_link=f"/order-confirmation/{order_number}"
            )
            send_admin_notification(
                title="New Order",
                message=f"A new order #{order_number} has been placed by {request.user.email}.",
                notification_type="order_placed",
                related_link=f"/admin/orders/{order_number}"
            )

        return Response(response_data, status=status.HTTP_201_CREATED)


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

        if order.status not in [Order.Status.PROCESSING, Order.Status.PAYMENT_PENDING]:
            return Response(
                {'error': 'Only processing or pending orders can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # restore stock
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save()

        order.status = Order.Status.CANCELLED
        order.save()

        send_notification(
            recipient=request.user,
            title="Order Cancelled",
            message=f"Your order #{order_number} has been cancelled.",
            notification_type="order_cancelled",
            related_link=f"/order-confirmation/{order_number}"
        )
        send_admin_notification(
            title="Order Cancelled",
            message=f"Order #{order_number} was cancelled by {request.user.email}.",
            notification_type="order_cancelled",
            related_link=f"/admin/orders/{order_number}"
        )

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

        send_admin_notification(
            title="Order Deleted",
            message=f"Order #{order_number} was permanently deleted by {request.user.email or request.user.username}.",
            notification_type="order_cancelled",
        )

        return Response({'message': 'Order deleted'}, status=status.HTTP_200_OK)


class VerifyRazorpayPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_number = request.data.get('order_number')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([order_number, razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {'error': 'Missing required payment verification details'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # verify signature
        import razorpay
        from django.conf import settings
        
        razorpay_client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            razorpay_client.utility.verify_payment_signature(params_dict)
            
            # signature is valid, update order status to processing
            order.status = Order.Status.PROCESSING
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.save()

            send_notification(
                recipient=request.user,
                title="Payment Successful",
                message=f"Payment for order #{order_number} was successful.",
                notification_type="payment_success",
                related_link=f"/order-confirmation/{order_number}"
            )
            send_admin_notification(
                title="New Order (Paid)",
                message=f"Order #{order_number} has been placed and paid by {request.user.email}.",
                notification_type="order_placed",
                related_link=f"/admin/orders/{order_number}"
            )

            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            order.status = Order.Status.FAILED
            order.save()
            return Response(
                {'error': 'Payment verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred during verification: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )