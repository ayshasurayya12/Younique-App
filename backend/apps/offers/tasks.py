from celery import shared_task
from django.utils import timezone
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


@shared_task(name='offers.activate_offers')
def activate_scheduled_offers():
    from apps.offers.models import Offer
    from apps.offers.services import apply_offer_to_products

    now = timezone.now()
    offers_to_activate = Offer.objects.filter(
        is_active=False,
        start_date__lte=now,
        end_date__gt=now,
    )

    for offer in offers_to_activate:
        try:
            with transaction.atomic():
                apply_offer_to_products(offer)
                offer.is_active = True
                offer.save()
                logger.info(f'Activated offer: {offer.name}')
        except Exception as e:
            logger.error(f'Failed to activate offer {offer.name}: {e}')

    return f'Activated {offers_to_activate.count()} offers'


@shared_task(name='offers.deactivate_offers')
def deactivate_expired_offers():
    from apps.offers.models import Offer
    from apps.offers.services import remove_offer_from_products

    now = timezone.now()
    offers_to_deactivate = Offer.objects.filter(
        is_active=True,
        end_date__lte=now,
    )

    for offer in offers_to_deactivate:
        try:
            with transaction.atomic():
                remove_offer_from_products(offer)
                offer.is_active = False
                offer.save()
                logger.info(f'Deactivated offer: {offer.name}')
        except Exception as e:
            logger.error(f'Failed to deactivate offer {offer.name}: {e}')

    return f'Deactivated {offers_to_deactivate.count()} offers'


@shared_task(name='offers.check_offers')
def check_and_process_offers():
    activate_result = activate_scheduled_offers()
    deactivate_result = deactivate_expired_offers()
    return f'{activate_result} | {deactivate_result}'