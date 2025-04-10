import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl glass p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Information Collection</h2>
            <p>We collect information necessary to verify your age and identity, process your orders, and provide our services in compliance with New York State cannabis regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Use of Information</h2>
            <p>Your information is used solely for order processing, delivery verification, and compliance with state regulations. We do not share your information with third parties except as required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information, including encryption and secure storage practices.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Age Verification Data</h2>
            <p>Age verification data is collected and stored in compliance with New York State cannabis regulations and is not used for any other purpose.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Changes to Privacy Policy</h2>
            <p>We reserve the right to update this privacy policy at any time. Changes will be posted on this page with an updated revision date.</p>
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

export default Privacy;