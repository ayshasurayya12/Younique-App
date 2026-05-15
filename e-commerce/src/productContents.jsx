import client from './api/client';

export const fetchAllProducts = async () => {
    try {
        const response = await client.get('/products/');
        return response.data.results || response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
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