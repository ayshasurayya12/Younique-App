from django.urls import path
from .views import (
    ProductListView, ProductDetailView, FeaturedProductsView, CategoryListView,
    UserWishlistListView, UserWishlistDetailView
)
from .admin_views import (
    AdminProductListView, AdminProductDetailView, AdminProductImageUpload,
    AdminWishlistListView, AdminWishlistDetailView
)

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/featured/', FeaturedProductsView.as_view(), name='featured-products'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    
    # User Wishlist
    path('wishlist/', UserWishlistListView.as_view(), name='user-wishlist'),
    path('wishlist/<int:pk>/', UserWishlistDetailView.as_view(), name='user-wishlist-detail'),
    
    # Admin Wishlist
    path('admin/products/', AdminProductListView.as_view(), name='admin-products'),
    path('admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('admin/products/<int:pk>/upload-image/', AdminProductImageUpload.as_view(), name='admin-product-image'),
    path('admin/wishlists/', AdminWishlistListView.as_view(), name='admin-wishlists'),
    path('admin/wishlists/<int:pk>/', AdminWishlistDetailView.as_view(), name='admin-wishlist-detail'),
]