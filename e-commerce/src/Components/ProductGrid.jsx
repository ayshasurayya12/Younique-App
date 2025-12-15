import React from 'react'
import ProductCard from './ProductCard'


const ProductGrid = ({ products }) => { 
  return (
    <div className='grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 my-10'>
      
        {products.map((product) => {
            
            return <ProductCard key={product.id} product={product}/>
        })}
    </div>
  )
}

export default ProductGrid