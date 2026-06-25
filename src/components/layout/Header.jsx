import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import CountryToggle from './CountryToggle';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-2 sm:gap-3 px-4 md:px-6 py-3">
        <Link to="/" className="flex-shrink-0">
          <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">leggings</span>
        </Link>
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-border focus-within:border-primary/40 focus-within:bg-background transition-all">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.8} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leggings..."
            className="flex-1 min-w-0 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </form>
        <CountryToggle />
      </div>
    </header>
  );
}