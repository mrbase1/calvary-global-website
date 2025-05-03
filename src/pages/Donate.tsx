import React from 'react';
import { Footer } from '../components/Footer';
import { Heart } from 'lucide-react';
import boaLogo from '../assets/bank-of-america-logo-png_seeklogo-485152.png';
import ecobankLogo from '../assets/Ecobank-Logo.png';


export function Donate() {
  const banks = [
    {
      name: 'Bank of America',
      logo: boaLogo,
      accountName: 'Calvary Outreach Ministries International (USA)',
      accountNumber: '388006802885',
      swiftCode: 'BOFAUS3N',
    },
    {
      name: 'Ecobank (USD)',
      logo: ecobankLogo,
      accountName: 'Calvary Global Prayer & Healing Center',
      accountNumber: '3720048548 USD',
      swiftCode: '',
    },
    {
      name: 'Ecobank (Naira)',
      logo: ecobankLogo,
      accountName: 'Calvary Global Prayer & Healing Center',
      accountNumber: '3720020634',
      swiftCode: '',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-purple-700 py-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-16 w-16 text-white mx-auto mb-8" />
          <h1 className="text-4xl font-bold text-white mb-6">
            Make a Donation
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Your generous contribution helps us expand our prayer networks and impact more lives globally.
          </p>
        </div>
      </section>

      {/* Bank Details Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Bank Transfer Details
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              You can make donations through any of our bank accounts below
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {banks.map((bank, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="h-12 mb-6">
                    <img
                      src={bank.logo}
                      alt={`${bank.name} logo`}
                      className="h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {bank.name}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <span className="font-medium">Account Name:</span>
                      <br />
                      {bank.accountName}
                    </p>
                    <p>
                      <span className="font-medium">Account Number:</span>
                      <br />
                      {bank.accountNumber}
                    </p>
                    <p>
                      <span className="font-medium">Swift Code:</span>
                      <br />
                      {bank.swiftCode}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              For international transfers, please use the SWIFT code provided.
              <br />
              For any questions about donations, please contact us at{' '}
              <a href="mailto:donations@cgphc.org" className="text-purple-600 hover:text-purple-800">
                donations@cgphc.org
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}