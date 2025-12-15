import React from 'react';
import Footer from '../Components/Footer'; 
import { Leaf, FlaskConical, Heart } from 'lucide-react';
import {useNavigate} from 'react-router-dom'

const About = () => {
  const navigate = useNavigate()
  const handleClick = ()=>{
    navigate("/allproducts")
  }
  return (
    <div className='bg-white'>
      <div className='container mx-auto px-4 py-16'>
        
        
        <section className='text-center mb-16'>
          <h1 className='text-5xl font-extrabold text-[#B37869] mb-4'>
            Our Philosophy: Authenticity in Skincare
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            We believe true beauty is achieved through <strong>transparency</strong>, <strong>efficiancy</strong>, and a deep respect for both <strong>nature</strong> and <strong>science</strong>.
          </p>
        </section>

      
        <section className='grid md:grid-cols-2 gap-12 items-center mb-16 border-t pt-12'>
          <div>
            <h2 className='text-3xl font-bold text-gray-800 mb-4'>
              The Heart of Our Skincare Journey
            </h2>
            <p className='text-gray-700 leading-relaxed mb-4'>
              Our brand was founded on the simple idea that effective skincare shouldn't be complicated or harsh. We meticulously source our ingredients, focusing on <strong>time-tested traditional remedies</strong> alongside <strong>modern dermatological advancements</strong>.
            </p>
            <p className='text-gray-700 leading-relaxed'>
              Every product, from our gentle cleansers to our powerful sunscreens, is designed to enhance your skin's natural health, not cover it up. We stand for clean formulations and clear results.
            </p>
          </div>
          <div className='h-96 bg-gray-100 rounded-lg shadow-xl overflow-hidden'>
            <img src="./herooo.png"/>
            
          </div>
        </section>
        
        
        <section className='mb-16'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-10'>
            Our Commitments
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            
            
            <div className='text-center p-6 bg-amber-50 rounded-lg shadow-lg'>
              <Leaf size={48} className='mx-auto text-[#B37869] mb-4'/>
              <h3 className='text-xl font-semibold mb-2'>Natural Sourcing</h3>
              <p className='text-gray-700'>
                We prioritize <strong>potent, naturally derived actives</strong> like rice water, propolis, and green tea, ensuring purity and efficacy in every bottle.
              </p>
            </div>
            
          
            <div className='text-center p-6 bg-amber-50 rounded-lg shadow-lg'>
              <FlaskConical size={48} className='mx-auto text-[#B37869] mb-4'/>
              <h3 className='text-xl font-semibold mb-2'>Science-Backed Formulas</h3>
              <p className='text-gray-700'>
                Our formulations are developed with <strong>dermatologists</strong> to ensure stability, safety, and compatibility with sensitive skin types.
              </p>
            </div>
            
      
            <div className='text-center p-6 bg-amber-50 rounded-lg shadow-lg'>
              <Heart size={48} className='mx-auto text-[#B37869] mb-4'/>
              <h3 className='text-xl font-semibold mb-2'>Ethical & Sustainable</h3>
              <p className='text-gray-700'>
                We are proudly <strong>cruelty-free</strong>, committed to minimal environmental impact, and dedicated to sustainable packaging practices.
              </p>
            </div>
            
          </div>
        </section>
        
        
        <section className='text-center pt-8 border-t'>
          <p className='text-xl text-gray-700 mb-6'>
            Thank you for trusting us with your skin. Discover the difference that conscious care makes.
          </p>
          <button className='bg-[#C58B7A] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#B37869] transition-all duration-300' onClick={handleClick}>
            Shop All Products
          </button>
        </section>

      </div>
  
    </div>
  );
}

export default About;