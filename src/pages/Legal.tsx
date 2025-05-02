import React, { useState } from 'react';
import { Footer } from '../components/Footer';
import incorporationCGPHC from '../assets/incorporation-cgphc.jpg';
import incorporationPartners from '../assets/incorporation-partners-for-rural-dev.jpg';
import scumlCGPHC from '../assets/scuml-cgphc.jpg';
import scumlPartners from '../assets/scuml-partners-for-rural-dev.jpg';
import ordinationCert from '../assets/ordination-cert.jpg';
import partnersBrochure1 from '../assets/partners-for-rural-dev-brochure.jpg';
import partnersBrochure2 from '../assets/partners-for-rural-dev-brochure-2.jpg';

export function Legal() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const documents = [
    {
      title: 'CGPHC Certificate of Incorporation',
      description: 'Official registration of Calvary Global Prayer & Healing Center',
      image: incorporationCGPHC
    },
    {
      title: 'Partners for Rural Development Foundation Registration',
      description: 'Certificate of Incorporation for Partners for Rural Development Foundation',
      image: incorporationPartners
    },
    {
      title: 'CGPHC SCUML Certificate',
      description: 'Special Control Unit Against Money Laundering certification for CGPHC',
      image: scumlCGPHC
    },
    {
      title: 'Partners Foundation SCUML Certificate',
      description: 'Special Control Unit Against Money Laundering certification for Partners Foundation',
      image: scumlPartners
    },
    {
      title: 'Ordination Certificate',
      description: 'Rev. Godswill Keenam\'s Ordination Certificate',
      image: ordinationCert
    },
    {
      title: 'Partners Foundation Brochure',
      description: 'Official brochure of Partners for Rural Development Foundation',
      image: partnersBrochure1
    },
    {
      title: 'Partners Foundation Overview',
      description: 'Detailed overview of Partners for Rural Development Foundation',
      image: partnersBrochure2
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-24"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Legal & Regulatory Compliance
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Official documentation and certifications of our organizations
          </p>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedImage(doc.image)}
              >
                <div className="aspect-w-3 aspect-h-4">
                  <img
                    src={doc.image}
                    alt={doc.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-gray-600">{doc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              className="absolute top-4 right-4 text-white hover:text-purple-400 text-xl"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Document preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}