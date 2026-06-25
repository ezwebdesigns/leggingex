import { createContext, useContext, useState, useCallback } from 'react';

const CountryContext = createContext(null);

const MARKETPLACE_MAP = { CA: 'amazon.ca', US: 'amazon.com' };
const PREFIX_MAP = { CA: 'CA$', US: 'US$' };
const FLAG_MAP = { CA: '🇨🇦', US: '🇺🇸' };
const LABEL_MAP = { CA: 'Canada', US: 'États-Unis' };

function getInitialCountry() {
  try {
    const stored = localStorage.getItem('shopping_country');
    return stored === 'US' ? 'US' : 'CA';
  } catch {
    return 'CA';
  }
}

export function CountryProvider({ children }) {
  const [country, setCountryState] = useState(getInitialCountry);

  const setCountry = useCallback((c) => {
    setCountryState(c);
    try {
      localStorage.setItem('shopping_country', c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = {
    country,
    setCountry,
    marketplace: MARKETPLACE_MAP[country],
    currencyPrefix: PREFIX_MAP[country],
    flag: FLAG_MAP[country],
    label: LABEL_MAP[country],
  };

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
}

export { MARKETPLACE_MAP, PREFIX_MAP };