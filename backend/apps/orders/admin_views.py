from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Order, OrderItem
from .serializers import OrderSerializer
from apps.accounts.models import User
from apps.products.models import Product

class OrderPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 50


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # order counts
        total_orders = Order.objects.count()
        processing = Order.objects.filter(status='Processing').count()
        shipped = Order.objects.filter(status='Shipped').count()
        delivered = Order.objects.filter(status='Delivered').count()
        cancelled = Order.objects.filter(status='Cancelled').count()

        # revenue
        total_revenue = Order.objects.exclude(
            status='Cancelled'
        ).aggregate(total=Sum('total'))['total'] or 0

        # users and products count
        total_users = User.objects.filter(is_staff=False).count()
        total_products = Product.objects.count()

        # revenue by day (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        daily_orders = Order.objects.filter(
            created_at__gte=thirty_days_ago
        ).exclude(status='Cancelled')

        revenue_map = {}
        for order in daily_orders:
            date_key = order.created_at.strftime('%b %d')
            if date_key not in revenue_map:
                revenue_map[date_key] = 0
            revenue_map[date_key] += float(order.total)

        revenue_data = [
            {'date': date, 'total': total}
            for date, total in revenue_map.items()
        ]

        # products by category
        from apps.products.models import Category
        categories = Category.objects.all()
        category_data = [
            {
                'name': cat.name,
                'value': Product.objects.filter(category=cat).count()
            }
            for cat in categories
        ]

        # best sellers
        best_sellers = OrderItem.objects.values(
            'product__id', 'title'
        ).annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:5]

        best_sellers_list = [
            {
                'productId': item['product__id'],
                'title': item['title'],
                'quantity': item['total_sold']
            }
            for item in best_sellers
        ]

        return Response({
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'total_users': total_users,
            'total_products': total_products,
            'status_counts': {
                'processing': processing,
                'shipped': shipped,
                'delivered': delivered,
                'cancelled': cancelled,
            },
            'revenue_data': revenue_data,
            'category_data': category_data,
            'best_sellers': best_sellers_list,
        })


class AdminOrderListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.all().order_by('-created_at')

        status_filter = request.query_params.get('status')
        search = request.query_params.get('search', '')

        if status_filter and status_filter != 'all':
            orders = orders.filter(status__iexact=status_filter)

        if search:
            orders = orders.filter(
                Q(order_number__icontains=search) |
                Q(shipping_name__icontains=search) |
                Q(shipping_email__icontains=search)
            )

        paginator = OrderPagination()
        paginated_orders = paginator.paginate_queryset(orders, request)

        # add user info
        result = []
        for order in paginated_orders:
            data = OrderSerializer(order).data
            data['user_name'] = order.user.get_full_name() or order.user.username
            data['user_email'] = order.user.email
            result.append(data)

        return paginator.get_paginated_response(result)


class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        data = OrderSerializer(order).data
        data['user_name'] = order.user.get_full_name() or order.user.username
        data['user_email'] = order.user.email
        return Response(data)

    def patch(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'Status is required'}, status=400)

        valid_statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled']
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=400)

        # if cancelling, restore stock
        if new_status == 'Cancelled' and order.status != 'Cancelled':
            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save()

        order.status = new_status
        order.save()

        data = OrderSerializer(order).data
        data['user_name'] = order.user.get_full_name() or order.user.username
        return Response(data)

    def delete(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        order.delete()
        return Response({'message': 'Order deleted'})