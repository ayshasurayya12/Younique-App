import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import razorpay
from django.conf import settings

try:
    print(f"Key ID: {settings.RAZORPAY_KEY_ID}")
    print(f"Secret: {settings.RAZORPAY_KEY_SECRET[:5]}...")
    
    razorpay_client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )
    
    razorpay_order = razorpay_client.order.create({
        "amount": 10000,
        "currency": "INR",
        "receipt": "TEST_RECEIPT_1",
        "payment_capture": 1
    })
    print("SUCCESS")
    print(razorpay_order)
except Exception as e:
    print("ERROR OCCURRED:")
    import traceback
    traceback.print_exc()
