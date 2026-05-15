import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product

def fix_image_casing():
    media_root = 'media'
    products = Product.objects.all()
    count = 0
    
    # Get a map of lowercase filename to actual filename on disk
    on_disk = {}
    products_dir = os.path.join(media_root, 'products')
    if os.path.exists(products_dir):
        for f in os.listdir(products_dir):
            on_disk[f.lower()] = f
    
    for product in products:
        current_path = str(product.image)
        if not current_path:
            continue
            
        filename = os.path.basename(current_path)
        if filename.lower() in on_disk:
            correct_filename = on_disk[filename.lower()]
            if filename != correct_filename:
                new_path = f"products/{correct_filename}"
                product.image = new_path
                product.save()
                count += 1
                print(f"Fixed casing: {filename} -> {correct_filename}")
        else:
            print(f"File not found on disk: {filename}")
    
    print(f"Total fixed: {count}")

if __name__ == '__main__':
    fix_image_casing()
