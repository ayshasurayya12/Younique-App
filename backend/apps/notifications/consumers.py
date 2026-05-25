import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return

        # Create a group name specific to the user
        self.user_group_name = f'user_{self.user.id}_notifications'

        # Join the user's specific group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        # If user is admin, also add them to the admin notifications group
        if self.user.is_staff or self.user.is_superuser:
            await self.channel_layer.group_add(
                'admin_notifications',
                self.channel_name
            )

        await self.accept()

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            # Leave the user's specific group
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

            # Leave the admin group if applicable
            if self.user.is_staff or self.user.is_superuser:
                await self.channel_layer.group_discard(
                    'admin_notifications',
                    self.channel_name
                )

    # Receive message from room group
    async def send_notification(self, event):
        notification_data = event['notification']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': notification_data
        }))
