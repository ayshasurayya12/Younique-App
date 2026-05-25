from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.utils import timezone
from .models import Offer
from .serializers import OfferSerializer
from .services import apply_offer_to_products, remove_offer_from_products
from .tasks import check_and_process_offers


class AdminOfferListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        offers = Offer.objects.all()
        return Response(OfferSerializer(offers, many=True).data)

    def post(self, request):
        serializer = OfferSerializer(data=request.data)
        if serializer.is_valid():
            offer = serializer.save()
            if offer.start_date <= timezone.now() <= offer.end_date:
                apply_offer_to_products(offer)
                offer.is_active = True
                offer.save()
            return Response(OfferSerializer(offer).data, status=201)
        return Response(serializer.errors, status=400)


class AdminOfferDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            offer = Offer.objects.get(pk=pk)
        except Offer.DoesNotExist:
            return Response({'error': 'Offer not found'}, status=404)
        return Response(OfferSerializer(offer).data)

    def patch(self, request, pk):
        try:
            offer = Offer.objects.get(pk=pk)
        except Offer.DoesNotExist:
            return Response({'error': 'Offer not found'}, status=404)
        serializer = OfferSerializer(offer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            offer = Offer.objects.get(pk=pk)
        except Offer.DoesNotExist:
            return Response({'error': 'Offer not found'}, status=404)
        if offer.is_active:
            remove_offer_from_products(offer)
        offer.delete()
        return Response({'message': 'Offer deleted'})


class AdminToggleOfferView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            offer = Offer.objects.get(pk=pk)
        except Offer.DoesNotExist:
            return Response({'error': 'Offer not found'}, status=404)

        if offer.is_active:
            remove_offer_from_products(offer)
            offer.is_active = False
            offer.save()
            return Response({'message': 'Offer deactivated', 'is_active': False})
        else:
            apply_offer_to_products(offer)
            offer.is_active = True
            offer.save()
            return Response({'message': 'Offer activated', 'is_active': True})


class AdminRunOffersNowView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        result = check_and_process_offers.delay()
        return Response({'message': 'Offer processing triggered', 'task_id': str(result.id)})


class ActiveOffersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        now = timezone.now()
        offers = Offer.objects.filter(is_active=True, end_date__gt=now)
        return Response(OfferSerializer(offers, many=True).data)