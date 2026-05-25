from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('order_status', 'Order Status Changed'),
        ('order_placed', 'Order Placed'),
        ('order_cancelled', 'Order Cancelled'),
        ('payment_success', 'Payment Successful'),
        ('account_status', 'Account Status Changed'),
        ('new_user', 'New User Registered'),
        ('system', 'System Notification'),
        ('offer_started', 'Offer Started'),
    )

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    related_link = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.email} - {self.title}"
