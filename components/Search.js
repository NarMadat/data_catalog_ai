import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconArrowElbow } from '@/components/ui/icons';
import './Search.css';
import data from '@/data/data.json'; 

function Search({ onNotFound }) {
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState(null); 
  const [showResults, setShowResults] = useState(true); 

  const handleSearch = () => {
    if (query.trim() === '') {
      setFilteredData([]);
      setNotFound(false);
      onNotFound(false);
      return;
    }

    const filtered = searchTree(data, query.toLowerCase(), []);
    setFilteredData(filtered);

    const isNotFound = filtered.length === 0;
    setNotFound(isNotFound);
    onNotFound(isNotFound);
  };

  const searchTree = (node, searchTerm, path) => {
    let results = [];

    const newPath = [...path, node.name];

    if (node.name && node.name.toLowerCase().includes(searchTerm)) {
      results.push({ name: node.name, path: newPath, metadata: node.metadata || null });
    }

    if (node.children) {
      node.children.forEach((child) => {
        results = results.concat(searchTree(child, searchTerm, newPath));
      });
    }

    return results;
  };

  const handleResultClick = (metadata) => {
    if (metadata) {
      setSelectedMeta(metadata); 
      setShowResults(false); 
    }
  };

  const handleBackClick = () => {
    setShowResults(true); 
    setSelectedMeta(null); 
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const metaKeysMap = {
    columnE: 'Համակարգի անուն',
    columnF: 'Իրավական հիմքեր',
    columnG: 'Գաղտնիություն',
    columnH: 'Ամբողջականություն',
    columnI: 'Հասանելիություն',
    columnJ: 'Վավերականություն',
    columnK: 'Խմբավորման անուն'
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative flex items-center bg-transparent rounded-lg shadow-sm p-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}  // Добавляем обработчик события
          placeholder="Փնտրել տեղեկություն․․․"
          className="min-h-[20px] w-full resize-none bg-transparent px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none"
        />
        <div className="flex items-center ml-2">
          <Button
            type="button"
            onClick={handleSearch}
            size="sm"
            className="w-10 h-8 rounded-full search-button bg-blue-950 text-white font-semibold flex items-center justify-center transition-colors hover:bg-blue-600"
          >
            <IconArrowElbow className="w-3 h-3" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {notFound && (
          <div className="not-found-message bg-red-500 text-red p-2 rounded-lg text-center mb-4">
            <p>No results found. Try using AI search.</p>
          </div>
        )}

        {showResults ? (
          filteredData.length > 0 && (
            <ul className="result-list">
              {filteredData.map((item, index) => (
                <li
                  key={index}
                  className="result-item"
                  onClick={() => handleResultClick(item.metadata)}
                >
                  {item.path.join(' -> ')}
                </li>
              ))}
            </ul>
          )
        ) : (
          selectedMeta && (
            <div
              onClick={handleBackClick}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  padding: '30px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  width: '500px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  fontFamily: '"Roboto", sans-serif',
                  pointerEvents: 'auto',
                }}
              >
                <h2 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '24px' }}>Մետադատա</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
                  <tbody>
                    {Object.entries(selectedMeta).map(([key, value]) => (
                      <tr key={key}>
                        <td style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: '12px' }}>
                          {metaKeysMap[key] || key}:
                        </td>
                        <td style={{ borderBottom: '1px solid #ddd', padding: '12px' }}>{value || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={handleBackClick}
                  style={{
                    marginTop: '30px',
                    padding: '12px 24px',
                    backgroundColor: '#555',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '16px',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Search;


















