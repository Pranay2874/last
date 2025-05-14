import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProviderProps {
  children: React.ReactNode;
}

const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  return (
    <>
      <Helmet>
        <title>MakeAFrnd - Connect with Strangers</title>
        <meta name="description" content="Connect with random strangers through various chat filters. Find friends based on common interests or specific preferences." />
        <meta name="keywords" content="chat, strangers, random chat, make friends, online chat, common interests, gender chat" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://makeafrnd.com/" />
        <meta property="og:title" content="MakeAFrnd - Connect with Strangers" />
        <meta property="og:description" content="Connect with random strangers through various chat filters. Find friends based on common interests or specific preferences." />
        <meta property="og:image" content="https://makeafrnd.com/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://makeafrnd.com/" />
        <meta property="twitter:title" content="MakeAFrnd - Connect with Strangers" />
        <meta property="twitter:description" content="Connect with random strangers through various chat filters. Find friends based on common interests or specific preferences." />
        <meta property="twitter:image" content="https://makeafrnd.com/twitter-image.jpg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://makeafrnd.com/" />
      </Helmet>
      {children}
    </>
  );
};

export default SEOProvider;