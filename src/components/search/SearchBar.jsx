import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  'Yoga leggings',
  'Sports leggings',
  'High waisted leggings',
  'Kids leggings',
  'Plus size leggings',
  'Fashion leggings',
  'Thermal leggings',
  'Push-up leggings',
];

export default function SearchBar({ large = false, initialValue = '', onSearch }) {
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setFocused(false);
    }
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    if (onSearch) {
      onSearch(s);
    } else {
      navigate(`/search?q=${encodeURIComponent(s)}`);
    }
    setFocused(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          flex items-center gap-3 bg-secondary rounded-2xl border transition-all duration-200
          ${large ? 'px-5 py-4' : 'px-4 py-3'}
          ${focused ? 'border-primary/40 shadow-lg shadow-primary/10 bg-background' : 'border-border hover:border-border/80'}
        `}>
          <Search className={`flex-shrink-0 text-muted-foreground ${large ? 'w-5 h-5' : 'w-4 h-4'}`} strokeWidth={1.8} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="What leggings are you looking for?"
            className={`flex-1 min-w-0 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium ${large ? 'text-base' : 'text-sm'}`}
          />
          {query && (
            <button
              type="submit"
              className={`flex-shrink-0 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-all duration-200 ${large ? 'w-9 h-9' : 'w-8 h-8'}`}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-3 py-2 font-medium">Suggestions</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onMouseDown={() => handleSuggestion(s)}
                className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-xl transition-colors flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={1.8} />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}