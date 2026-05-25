from django.db import models
from apps.products.models import Product, Category


class Offer(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'percentage', 'Percentage'
        FLAT = 'flat', 'Flat Amount'

    class OfferTarget(models.TextChoices):
        PRODUCT = 'product', 'Specific Product'
        CATEGORY = 'category', 'Entire Category'

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE
    )
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    target = models.CharField(
        max_length=20,
        choices=OfferTarget.choices,
        default=OfferTarget.PRODUCT
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='offers'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='offers'
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} ({self.discount_value}{"%" if self.discount_type == "percentage" else "₹"} off)'

    class Meta:
        ordering = ['-created_at']


class OriginalPrice(models.Model):
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name='original_price'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    offer = models.ForeignKey(
        Offer,
        on_delete=models.SET_NULL,
        null=True,
        related_name='price_backups'
    )

    def __str__(self):
        return f'{self.product.title} original: ₹{self.price}'