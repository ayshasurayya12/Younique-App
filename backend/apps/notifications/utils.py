from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from .models import Notification
from .serializers import NotificationSerializer

User = get_user_model()

def send_notification(recipient, title, message, notification_type, related_link=None):
    """
    Creates a notification in the database and sends it over WebSockets.
    """
    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        related_link=related_link
    )
    
    channel_layer = get_channel_layer()
    serializer = NotificationSerializer(notification)
    
    # Send to the specific user's group
    async_to_sync(channel_layer.group_send)(
        f'user_{recipient.id}_notifications',
        {
            'type': 'send_notification',
            'notification': serializer.data
        }
    )

def send_admin_notification(title, message, notification_type, related_link=None):
    """
    Sends a notification to all superusers/staff individually.
    """
    admins = User.objects.filter(is_staff=True)
    channel_layer = get_channel_layer()
    for admin in admins:
        notification = Notification.objects.create(
            recipient=admin,
            title=title,
            message=message,
            notification_type=notification_type,
            related_link=related_link
        )
        serializer = NotificationSerializer(notification)
        async_to_sync(channel_layer.group_send)(
            f'user_{admin.id}_notifications',
            {
                'type': 'send_notification',
                'notification': serializer.data
            }
        )
