from django.urls import path
from .views import (
    CartListView, AddToCartView, UpdateCartItemView,
    RemoveCartItemView, ClearCartView, CartCountView,
    PlaceOrderView, OrderListView, OrderDetailView,
    CancelOrderView, DeleteOrderView, VerifyRazorpayPaymentView
)
from .admin_views import AdminDashboardView, AdminOrderListView, AdminOrderDetailView

urlpatterns = [
    # cart
    path('cart/', CartListView.as_view(), name='cart-list'),
    path('cart/add/', AddToCartView.as_view(), name='cart-add'),
    path('cart/clear/', ClearCartView.as_view(), name='cart-clear'),
    path('cart/count/', CartCountView.as_view(), name='cart-count'),
    path('cart/<int:pk>/', UpdateCartItemView.as_view(), name='cart-update'),
    path('cart/<int:pk>/remove/', RemoveCartItemView.as_view(), name='cart-remove'),

    # orders
    path('orders/', PlaceOrderView.as_view(), name='place-order'),
    path('orders/razorpay/verify/', VerifyRazorpayPaymentView.as_view(), name='razorpay-verify'),
    path('orders/list/', OrderListView.as_view(), name='order-list'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<str:order_number>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    path('orders/<str:order_number>/delete/', DeleteOrderView.as_view(), name='order-delete'),

    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('admin/orders/<str:order_number>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
]