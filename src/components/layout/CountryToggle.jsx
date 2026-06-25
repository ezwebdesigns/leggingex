import { useCountry } from '@/contexts/CountryContext';

export default function CountryToggle({ compact = false }) {
  const { country, setCountry } = useCountry();

  return (
    <div className="flex items-center gap-0.5 bg-secondary rounded-xl p-0.5 border border-border/50 flex-shrink-0">
      <button
        onClick={() => setCountry('CA')}
        title="Canada"
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
          country === 'CA'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="text-sm leading-none">🇨🇦</span>
        {!compact && <span className="hidden sm:inline">CA</span>}
      </button>
      <button
        onClick={() => setCountry('US')}
        title="United States"
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
          country === 'US'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="text-sm leading-none">🇺🇸</span>
        {!compact && <span className="hidden sm:inline">US</span>}
      </button>
    </div>
  );
}