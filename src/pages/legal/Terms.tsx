import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl glass p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Skyclub Members' services, you agree to comply with and be bound by these Terms of Service, which are governed by New York State cannabis laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Age Verification</h2>
            <p>You must be 21 years of age or older to use our services. We reserve the right to verify your age and identity at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Compliance with NY Cannabis Laws</h2>
            <p>All services provided comply with New York State's Marijuana Regulation and Taxation Act (MRTA) and related regulations. Users must comply with all applicable state and local laws regarding cannabis possession and use.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Purchase and Delivery</h2>
            <p>All purchases and deliveries are subject to New York State cannabis regulations. Delivery is only available within authorized zones in New York City. Valid government-issued ID is required for all deliveries.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Product Disclaimer</h2>
            <p>Cannabis products may be intoxicating and can impair cognition. Keep out of reach of children. There may be health risks associated with consumption. Should not be used by pregnant or breastfeeding women.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Limitation of Liability</h2>
            <p>Skyclub Members shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
          </section>

          <div className="mt-8 text-sm text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>© {new Date().getFullYear()} Skyclub Members. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;