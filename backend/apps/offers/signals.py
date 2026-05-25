from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Offer


@receiver(post_save, sender=Offer)
def handle_offer_save(sender, instance, created, **kwargs):
    if instance.is_active:
        from apps.offers.models import OriginalPrice
        from apps.offers.services import apply_offer_to_products
        already_applied = OriginalPrice.objects.filter(offer=instance).exists()
        if not already_applied:
            apply_offer_to_products(instance)