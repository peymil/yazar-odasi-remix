import React, { useId } from 'react';
import { cn } from '~/lib/utils';
import { X } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: Option[];
  value: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  name: string;
  placeholder?: string;
  required?: boolean;
}

export function MultiSelect({
  className,
  options,
  value = [],
  onChange,
  name,
  placeholder = 'Seçiniz...',
  required = false,
  ...props
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputId = useId();

  // Sort options to show selected items at the top
  const sortedOptions = React.useMemo(() => {
    const selected = options.filter((option) => value.includes(option.value));
    const unselected = options.filter((option) => !value.includes(option.value));
    return [...selected, ...unselected];
  }, [options, value]);

  const filteredOptions = sortedOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string | number) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    
    onChange?.(newValue);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      {...props}
    >
      {/* Hidden form inputs for form submission */}
      {value.map((v) => (
        <input key={v} type="hidden" name={`${name}[]`} value={v} />
      ))}
      {required && value.length === 0 && (
        <input
          type="hidden"
          name={`${name}[]`}
          required
          id={inputId}
        />
      )}

      <div
        className={cn(
          'flex min-h-[2.5rem] w-full flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          isOpen && 'ring-2 ring-ring ring-offset-2',
        )}
        onClick={() => setIsOpen(true)}
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((v) => {
              const option = options.find((o) => o.value === v);
              return (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-sm text-secondary-foreground"
                >
                  {option?.label}
                  <button
                    type="button"
                    className="text-secondary-foreground/50 hover:text-secondary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(v);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="sticky top-0 bg-popover p-2">
            <input
              type="text"
              className="w-full rounded-sm border-0 bg-background px-2 py-1 text-sm outline-none ring-1 ring-input focus:ring-2 focus:ring-ring"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="p-1">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm',
                  value.includes(option.value)
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {value.includes(option.value) && (
                  <span className="text-xs">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
