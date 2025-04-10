import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentMethod {
  id: string;
  last4: string;
  type: string;
  isDefault: boolean;
}

interface Props {
  methods: PaymentMethod[];
  onAdd: () => void;
}

const PaymentMethods: React.FC<Props> = ({ methods, onAdd }) => {
  return (
    <div className="space-y-4">
      {methods.map((method) => (
        <div 
          key={method.id}
          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <div>
              <p className="font-medium">
                •••• {method.last4}
              </p>
              <p className="text-sm text-gray-400">
                {method.type}
                {method.isDefault && (
                  <span className="ml-2 text-purple-400">Default</span>
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      <button 
        onClick={onAdd}
        className="w-full p-3 border border-white/20 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/5 transition"
      >
        <span>Add Payment Method</span>
      </button>
    </div>
  );
};

export default PaymentMethods;