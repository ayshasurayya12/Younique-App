from django.urls import path
from .views import (
    AdminOfferListView, AdminOfferDetailView,
    AdminToggleOfferView, AdminRunOffersNowView,
    ActiveOffersView,
)

urlpatterns = [
    path('offers/', ActiveOffersView.as_view(), name='active-offers'),
    path('admin/offers/', AdminOfferListView.as_view(), name='admin-offers'),
    path('admin/offers/run-now/', AdminRunOffersNowView.as_view(), name='admin-offers-run'),
    path('admin/offers/<int:pk>/', AdminOfferDetailView.as_view(), name='admin-offer-detail'),
    path('admin/offers/<int:pk>/toggle/', AdminToggleOfferView.as_view(), name='admin-offer-toggle'),
]