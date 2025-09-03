import { Search, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search for nearest results...", 
  suggestions = [],
  onSuggestionSelect 
}: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const nearestResults = useMemo(() => {
    if (!value.trim()) return [];
    
    return suggestions
      .filter(item => item.toLowerCase().includes(value.toLowerCase()))
      .sort((a, b) => {
        const aIndex = a.toLowerCase().indexOf(value.toLowerCase());
        const bIndex = b.toLowerCase().indexOf(value.toLowerCase());
        return aIndex - bIndex;
      })
      .slice(0, 5);
  }, [value, suggestions]);

  return (
    <div className="search-container">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/70" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="search-input w-full"
        />
        
        {showSuggestions && nearestResults.length > 0 && (
          <div className="search-results">
            {nearestResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-all duration-200"
                onClick={() => {
                  onSuggestionSelect?.(result);
                  onChange(result);
                  setShowSuggestions(false);
                }}
              >
                <TrendingUp className="h-4 w-4 text-primary/60" />
                <span className="text-foreground font-medium">{result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}