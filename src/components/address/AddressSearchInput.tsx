import React, { useState, useCallback } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import debounce from 'lodash/debounce';
import { AddressResult } from '../../types/address';
import { searchAddress } from '../../services/addressSearch';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: AddressResult) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

const AddressSearchInput: React.FC<Props> = ({
  value,
  onChange,
  onAddressSelect,
  disabled = false,
  required = false,
  placeholder = 'Search NYC address...'
}) => {
  const [searchResults, setSearchResults] = useState<AddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const results = await searchAddress(query);
        setSearchResults(results);

        if (results.length === 0) {
          setError('No addresses found in NYC. Please try a different search.');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to search address');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    performSearch(newValue);
  };

  const handleResultClick = (result: AddressResult) => {
    onAddressSelect(result);
    setSearchResults([]);
    setError(null);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className={`w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          minLength={3}
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-gray-900 rounded-lg border border-white/10 shadow-lg max-h-60 overflow-auto">
          {searchResults.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{result.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearchInput;