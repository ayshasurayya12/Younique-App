export const getImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    const backendURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    
    if (imagePath.startsWith('/media/')) {
        return `${backendURL}${imagePath}`;
    }
    
    return `${backendURL}/media/${imagePath}`;
};