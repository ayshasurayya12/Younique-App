import firebase_admin
from firebase_admin import credentials
import os

def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(
            os.path.join(os.path.dirname(os.path.dirname(__file__)), 
            'firebase-service-account.json')
        )
        firebase_admin.initialize_app(cred)