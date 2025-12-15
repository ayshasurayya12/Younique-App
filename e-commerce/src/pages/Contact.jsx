import React from 'react';
import { Phone, Mail, MapPin, Clock, Globe, MessageCircle } from 'lucide-react';

const Contact = () => {
  const contactInfo = {
    phone: '+91 8075290039',
    email: 'support@younique.com',
    address: 'Bengaluru- Karnataka',
    workingHours: 'Monday - Friday: 9:00 AM - 8:00 PM EST',
    website: 'www.younique.com'
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
  
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're here to help you with any questions about our products, orders, or skincare advice.
            Reach out to us through any of the following channels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
          <div className="space-y-8">
      
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
            
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Phone size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Call Us</h3>
                    <p className="text-gray-600">{contactInfo.phone}</p>
                    <p className="text-sm text-gray-500 mt-1">Available during working hours</p>
                  </div>
                </div>

              
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Mail size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Email Us</h3>
                    <p className="text-gray-600">{contactInfo.email}</p>
                    <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
                  </div>
                </div>

              
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <MapPin size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Visit Us</h3>
                    <p className="text-gray-600">{contactInfo.address}</p>
                    <p className="text-sm text-gray-500 mt-1">Our physical store location</p>
                  </div>
                </div>

      
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Clock size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Working Hours</h3>
                    <p className="text-gray-600">{contactInfo.workingHours}</p>
                    <p className="text-sm text-gray-500 mt-1">Saturday & Sunday: 10:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

      
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">Average Response Time</h3>
                  <p className="text-sm text-gray-600">We value your time</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#B37869]">2-4 hours</p>
                  <p className="text-sm text-gray-600">During working hours</p>
                </div>
              </div>
            </div>

          </div>

    
          <div className="space-y-8">
  
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Support</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                  <h3 className="font-semibold text-blue-800 mb-2">Order Support</h3>
                  <p className="text-blue-700 text-sm">
                    Need help with an existing order? Contact our order support team for tracking, returns, or exchange inquiries.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-5">
                  <h3 className="font-semibold text-green-800 mb-2">Product Inquiries</h3>
                  <p className="text-green-700 text-sm">
                    Questions about our products? Our skincare experts are available to help you choose the right products for your skin type.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-lg p-5">
                  <h3 className="font-semibold text-purple-800 mb-2">Technical Support</h3>
                  <p className="text-purple-700 text-sm">
                    Experiencing issues with our website or app? Our technical team is here to assist you.
                  </p>
                </div>
              </div>
            </div>

  
            <div className="bg-gradient-to-br from-[#B37869] to-[#C58B7A] rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Skincare Hub</h2>
              <p className="mb-6">
                Your one-stop destination for premium skincare products. We're committed to helping you achieve healthy, glowing skin.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-white" />
                  <span>{contactInfo.website}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-white" />
                  <span>{contactInfo.email}</span>
                </div>
              </div>

              
            </div>
          </div>
        </div>

        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-full">
            <span className="text-gray-600">💬</span>
            <p className="text-gray-700">
              For urgent matters, please call us directly at <span className="font-semibold">{contactInfo.phone}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;