export const getImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it starts with /media/, prepend the backend URL
    if (imagePath.startsWith('/media/')) {
        return `http://localhost:8000${imagePath}`;
    }
    
    // If it's a relative path (like 'products/img.jpg'), prepend /media/ and backend URL
    return `http://localhost:8000/media/${imagePath}`;
};