import json
import os
import django
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Category, Product

def import_products():
    with open('db.json', 'r') as f:
        data = json.load(f)
    
    products = data.get('products', [])
    print(f"Found {len(products)} products in db.json")

    for item in products:
        category_name = item.get('category', 'Uncategorized')
        category, created = Category.objects.get_or_create(
            name=category_name,
            defaults={'slug': slugify(category_name)}
        )
        
        # In case the name exists but slug is different or missing
        if not category.slug:
            category.slug = slugify(category_name)
            category.save()

        product, created = Product.objects.get_or_create(
            title=item.get('title'),
            defaults={
                'description': item.get('description', ''),
                'price': item.get('price', 0),
                'category': category,
                'image': item.get('image', ''),
                'stock': item.get('stock', 0),
                'is_featured': item.get('isFeatured', False),
            }
        )
        
        if created:
            print(f"Created product: {product.title}")
        else:
            print(f"Product already exists: {product.title}")

if __name__ == '__main__':
    import_products()
