'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { SearchIcon } from './icons';
import { Button } from './ui/button';
import { SearchResultItem } from './SearchResultItem';

export type SearchType = 'all' | 'users' | 'projects' | 'works' | 'competitions';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEBOUNCE_DELAY = 300; // ms

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SearchType>('all');
  const [offsets, setOffsets] = useState<Record<SearchType, number>>({
    all: 0,
    users: 0,
    projects: 0,
    works: 0,
    competitions: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const fetcher = useFetcher<any>();
  const navigate = useNavigate();

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clean up search state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setDebouncedQuery('');
      setSelectedType('all');
      setOffsets({
        all: 0,
        users: 0,
        projects: 0,
        works: 0,
        competitions: 0,
      });
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Debounce search query input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setOffsets({
        all: 0,
        users: 0,
        projects: 0,
        works: 0,
        competitions: 0,
      });
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Fetch search results whenever debounced query or type changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      const offset = offsets[selectedType];
      const url = `/api/search?q=${encodeURIComponent(debouncedQuery)}&type=${selectedType}&limit=5&offset=${offset}`;
      fetcher.load(url);
    }
  }, [debouncedQuery, selectedType, offsets]);

  // Handle search input change (debounced above)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleTypeChange = (type: SearchType) => {
    setSelectedType(type);
    setOffsets({
      all: 0,
      users: 0,
      projects: 0,
      works: 0,
      competitions: 0,
    });
  };

  const handleLoadMore = (type: SearchType) => {
    setOffsets((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 5,
    }));
  };

  const handleResultClick = (href: string) => {
    onClose();
    navigate(href);
  };

  const data = fetcher.data || {
    users: [],
    projects: [],
    works: [],
    competitions: [],
    totals: { users: 0, projects: 0, works: 0, competitions: 0 },
  };

  let displayResults = {
    users: data.users,
    projects: data.projects,
    works: data.works,
    competitions: data.competitions,
    totals: data.totals,
  };

  if (selectedType !== 'all') {
    const typedResults = {
      [selectedType]: data[selectedType] || [],
    } as any;
    displayResults = {
      users: selectedType === 'users' ? data.users : [],
      projects: selectedType === 'projects' ? data.projects : [],
      works: selectedType === 'works' ? data.works : [],
      competitions: selectedType === 'competitions' ? data.competitions : [],
      totals: {
        users: selectedType === 'users' ? data.totals?.users || 0 : 0,
        projects: selectedType === 'projects' ? data.totals?.projects || 0 : 0,
        works: selectedType === 'works' ? data.totals?.works || 0 : 0,
        competitions: selectedType === 'competitions' ? data.totals?.competitions || 0 : 0,
      },
    };
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-3 bg-transparent border-2 border-gray-300 rounded-lg px-4 py-2 focus-within:border-yo-orange">
            <SearchIcon className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="yazar, proje, açık çağrı ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-transparent border-none outline-none text-gray-800 text-base w-full placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 px-4 py-3 bg-gray-50">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('all')}
            className="text-sm"
          >
            Tümü
          </Button>
          <Button
            variant={selectedType === 'users' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('users')}
            className="text-sm"
          >
            Yazarlar
          </Button>
          <Button
            variant={selectedType === 'projects' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('projects')}
            className="text-sm"
          >
            Projeler
          </Button>
          <Button
            variant={selectedType === 'works' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('works')}
            className="text-sm"
          >
            Çalışmalar
          </Button>
          <Button
            variant={selectedType === 'competitions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('competitions')}
            className="text-sm"
          >
            Açık Çağrılar
          </Button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto">
          {!searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <SearchIcon className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-center">Arama yapmak için yazı yazın...</p>
            </div>
          ) : fetcher.state === 'loading' && !displayResults.users.length && !displayResults.projects.length && !displayResults.works.length && !displayResults.competitions.length ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Aranıyor...</p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Users Section */}
              {(selectedType === 'all' || selectedType === 'users') && (
                <div>
                  {displayResults.users.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                        Yazarlar ({displayResults.totals.users})
                      </div>
                      <div className="divide-y">
                        {displayResults.users.map((user) => (
                          <SearchResultItem
                            key={`user-${user.id}`}
                            item={user}
                            type="users"
                            onClick={handleResultClick}
                          />
                        ))}
                      </div>
                      {displayResults.totals.users > displayResults.users.length && (
                        <div className="px-4 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadMore('users')}
                          >
                            Daha fazla yükle
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Projects Section */}
              {(selectedType === 'all' || selectedType === 'projects') && (
                <div>
                  {displayResults.projects.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                        Projeler ({displayResults.totals.projects})
                      </div>
                      <div className="divide-y">
                        {displayResults.projects.map((project) => (
                          <SearchResultItem
                            key={`project-${project.id}`}
                            item={project}
                            type="projects"
                            onClick={handleResultClick}
                          />
                        ))}
                      </div>
                      {displayResults.totals.projects > displayResults.projects.length && (
                        <div className="px-4 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadMore('projects')}
                          >
                            Daha fazla yükle
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Works Section */}
              {(selectedType === 'all' || selectedType === 'works') && (
                <div>
                  {displayResults.works.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                        Çalışmalar ({displayResults.totals.works})
                      </div>
                      <div className="divide-y">
                        {displayResults.works.map((work) => (
                          <SearchResultItem
                            key={`work-${work.id}`}
                            item={work}
                            type="works"
                            onClick={handleResultClick}
                          />
                        ))}
                      </div>
                      {displayResults.totals.works > displayResults.works.length && (
                        <div className="px-4 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadMore('works')}
                          >
                            Daha fazla yükle
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Competitions Section */}
              {(selectedType === 'all' || selectedType === 'competitions') && (
                <div>
                  {displayResults.competitions.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                        Açık Çağrılar ({displayResults.totals.competitions})
                      </div>
                      <div className="divide-y">
                        {displayResults.competitions.map((competition) => (
                          <SearchResultItem
                            key={`competition-${competition.id}`}
                            item={competition}
                            type="competitions"
                            onClick={handleResultClick}
                          />
                        ))}
                      </div>
                      {displayResults.totals.competitions > displayResults.competitions.length && (
                        <div className="px-4 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadMore('competitions')}
                          >
                            Daha fazla yükle
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* No Results */}
              {searchQuery.trim().length >= 2 &&
                !displayResults.users.length &&
                !displayResults.projects.length &&
                !displayResults.works.length &&
                !displayResults.competitions.length && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                    <p className="text-center">No results found for "{searchQuery}"</p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
