import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const TermsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions - MakeAFrnd</title>
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-6">Terms and Conditions</h1>
          
          <div className="bg-gray-800 rounded-lg p-8">
            <p className="text-gray-300 mb-6">
              This page will be populated with the Terms and Conditions content by the site owner.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default TermsPage;