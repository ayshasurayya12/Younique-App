import client from './api/client';

export const fetchAllProducts = async (page = 1, category = '', search = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        if (category && category !== 'All Products') params.append('category', category);
        if (search) params.append('search', search);

        const response = await client.get(`/products/?${params.toString()}`);
        return {
            products: response.data.results || [],
            count: response.data.count || 0,
            next: response.data.next,
            previous: response.data.previous,
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { products: [], count: 0, next: null, previous: null };
    }
};

export const checkApiHealth = async () => {
    try {
        const response = await client.get('/products/');
        return response.status === 200;
    } catch (error) {
        console.error('API is not reachable:', error);
        return false;
    }
};