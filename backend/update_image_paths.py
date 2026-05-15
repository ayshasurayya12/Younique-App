import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

def update_image_paths():
    products = Product.objects.all()
    count = 0
    for product in products:
        old_path = str(product.image)
        if '/src/assets/imgs/' in old_path:
            filename = os.path.basename(old_path)
            new_path = f"products/{filename}"
            product.image = new_path
            product.save()
            count += 1
            print(f"Updated: {product.title} -> {new_path}")
    
    print(f"Total updated: {count}")

if __name__ == '__main__':
    update_image_paths()
