from django.urls import path
from .views import ProductListView, ProductDetailView, FeaturedProductsView, CategoryListView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/featured/', FeaturedProductsView.as_view(), name='featured-products'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
]