from decimal import Decimal
from apps.offers.models import Offer, OriginalPrice
from apps.products.models import Product


def get_products_for_offer(offer):
    if offer.target == Offer.OfferTarget.PRODUCT and offer.product:
        return Product.objects.filter(id=offer.product.id)
    elif offer.target == Offer.OfferTarget.CATEGORY and offer.category:
        return Product.objects.filter(category=offer.category)
    return Product.objects.none()


def calculate_discounted_price(original_price, offer):
    if offer.discount_type == Offer.DiscountType.PERCENTAGE:
        discount = original_price * (offer.discount_value / Decimal('100'))
        new_price = original_price - discount
    else:
        new_price = original_price - offer.discount_value
    return max(new_price, Decimal('1'))


def apply_offer_to_products(offer):
    products = get_products_for_offer(offer)

    for product in products:
        if hasattr(product, 'original_price'):
            continue
        OriginalPrice.objects.create(
            product=product,
            price=product.price,
            offer=offer,
        )
        product.price = calculate_discounted_price(product.price, offer)
        product.save()

    if products.count() > 0:
        try:
            from apps.notifications.utils import send_notification
            from django.contrib.auth import get_user_model
            User = get_user_model()

            if offer.target == Offer.OfferTarget.CATEGORY:
                subject = f'{offer.category.name} products'
            else:
                subject = offer.product.title if offer.product else 'selected products'

            discount_label = (
                f'{offer.discount_value}% off'
                if offer.discount_type == Offer.DiscountType.PERCENTAGE
                else f'₹{offer.discount_value} off'
            )

            title = f'🎉 New Offer: {offer.name}'
            message = f'Get {discount_label} on {subject}! Offer valid until {offer.end_date.strftime("%b %d, %Y")}.'

            users = User.objects.filter(is_staff=False, is_active=True)
            for user in users:
                send_notification(
                    recipient=user,
                    title=title,
                    message=message,
                    notification_type='offer_started',
                )
        except Exception:
            pass


def remove_offer_from_products(offer):
    backups = OriginalPrice.objects.filter(offer=offer)
    for backup in backups:
        product = backup.product
        product.price = backup.price
        product.save()
        backup.delete()