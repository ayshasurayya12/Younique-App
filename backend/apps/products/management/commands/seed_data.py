import json
import os

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.accounts.models import User
from apps.products.models import Category, Product
from apps.orders.models import Order, OrderItem


class Command(BaseCommand):
    help = 'Seed database from db.json'

    def handle(self, *args, **kwargs):

        # find db.json — one level up from backend/
        base_dir = os.path.dirname(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(os.path.abspath(__file__))
                    )
                )
            )
        )

        json_path = os.path.join(base_dir, 'db.json')

        if not os.path.exists(json_path):
            self.stdout.write(
                self.style.ERROR(f'db.json not found at {json_path}')
            )
            return

        with open(json_path, 'r') as f:
            data = json.load(f)

        # ── Categories ──────────────────────────────────────
        self.stdout.write('Seeding categories...')
        category_map = {}

        for product in data.get('products', []):
            cat_name = product.get('category', '').strip()

            if cat_name and cat_name not in category_map:
                cat, _ = Category.objects.get_or_create(
                    name=cat_name,
                    defaults={
                        'slug': slugify(cat_name)
                    }
                )

                category_map[cat_name] = cat

        self.stdout.write(
            self.style.SUCCESS(
                f'{len(category_map)} categories created'
            )
        )

        # ── Products ─────────────────────────────────────────
        self.stdout.write('Seeding products...')
        product_count = 0

        for p in data.get('products', []):

            cat_name = p.get('category', '').strip()
            category = category_map.get(cat_name)

            if not category:
                continue

            image_path = p.get('image', '')

            Product.objects.get_or_create(
                title=p['title'],
                defaults={
                    'description': p.get('description', ''),
                    'price': p.get('price', 0),
                    'category': category,
                    'image': image_path,
                    'stock': p.get('stock', 0),
                    'is_featured': p.get('isFeatured', False),
                }
            )

            product_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'{product_count} products created'
            )
        )

        # ── Users ────────────────────────────────────────────
        self.stdout.write('Seeding users...')
        user_count = 0
        user_map = {}

        for u in data.get('users', []):

            username = u.get('username', '').strip()
            email = u.get('email', '').strip()

            if not username or not email:
                continue

            if User.objects.filter(username=username).exists():
                user_map[u['id']] = User.objects.get(username=username)
                continue

            full_name = u.get('fullName', '').strip()

            first_name = (
                full_name.split()[0]
                if full_name else ''
            )

            last_name = (
                ' '.join(full_name.split()[1:])
                if full_name else ''
            )

            user = User.objects.create_user(
                username=username,
                email=email,
                password=u.get('password', 'changeme123'),
                first_name=first_name,
                last_name=last_name,
                phone=u.get('phone'),
                is_blocked=u.get('isBlocked', False),
                is_staff=u.get('role') == 'admin',
            )

            user_map[u['id']] = user
            user_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'{user_count} users created'
            )
        )

        # ── Orders ───────────────────────────────────────────
        self.stdout.write('Seeding orders...')
        order_count = 0

        for u in data.get('users', []):

            user = user_map.get(u['id'])

            if not user:
                continue

            for o in u.get('orders', []):

                if Order.objects.filter(
                    order_number=o['id']
                ).exists():
                    continue

                totals = o.get('totals', {})
                shipping = o.get('shippingInfo', {})

                order = Order.objects.create(
                    user=user,
                    order_number=o['id'],
                    status=o.get('status', 'Processing'),
                    payment_method=o.get(
                        'paymentMethod',
                        'Cash on Delivery'
                    ),
                    shipping_name=shipping.get(
                        'fullName',
                        ''
                    ),
                    shipping_email=shipping.get(
                        'email',
                        ''
                    ),
                    shipping_phone=shipping.get(
                        'phone',
                        ''
                    ),
                    shipping_pincode=shipping.get(
                        'pincode',
                        ''
                    ),
                    subtotal=totals.get('subtotal', 0),
                    shipping_cost=totals.get('shipping', 0),
                    tax=totals.get('tax', 0),
                    total=totals.get('total', 0),
                )

                for item in o.get('items', []):

                    OrderItem.objects.create(
                        order=order,
                        product_id=None,
                        title=item.get('title', ''),
                        price=item.get('price', 0),
                        quantity=item.get('quantity', 1),
                        image=item.get('image', ''),
                    )

                order_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'{order_count} orders created'
            )
        )

        self.stdout.write(
            self.style.SUCCESS('✅ Seed complete!')
        )