import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Award, Shield, Users } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      title: 'Licensed & Compliant',
      description: 'Fully licensed by New York State with strict quality control'
    },
    {
      icon: <Award className="w-6 h-6 text-blue-400" />,
      title: 'Premium Quality',
      description: 'Sourced from top cultivators and extracted using cutting-edge methods'
    },
    {
      icon: <Users className="w-6 h-6 text-green-400" />,
      title: 'Expert Staff',
      description: 'Knowledgeable team providing personalized recommendations'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-yellow-400" />,
      title: 'Lab Tested',
      description: 'All products undergo rigorous third-party testing'
    }
  ];

  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">About Skyclub Members</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Setting the standard for premium cannabis experiences in New York City.
            We combine luxury service with top-tier products for our distinguished members.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl text-center"
            >
              <div className="mb-4 inline-block p-3 rounded-full bg-white/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;