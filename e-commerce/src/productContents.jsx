import axios from 'axios';
import { useEffect, useState } from 'react';


export const fetchAllProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products');
    
    return response.data;
  } catch (error) {
    console.error("Error fetching products from API:", error);
    return []; 
  }
};

export const checkApiHealth = async () => {
    try {
        const response = await axios.get('http://localhost:3000/products');
        console.log('API Health Check:', response.status);
        return response.status === 200;
    } catch (error) {
        console.error('API is not reachable:', error);
        return false;
    }
}
