import React, { useState, useCallback } from 'react';
import { Search, Download } from 'lucide-react';
import Select from 'react-select';
import { useStore } from '../store/useStore';
import { AddFeatureDialog } from './AddFeatureDialog';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Option {
  value: string;
  label: string;
  type: 'screen' | 'feature';
  description?: string;
}

export function SearchBar() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const screens = useStore((state) => state.screens) || [];
  const setSearchTerm = useStore((state) => state.setSearchTerm);
  const searchResults = useStore((state) => state.searchResults) || [];

  const options: Option[] = screens.flatMap(screen => [
    { value: screen.id, label: screen.name, type: 'screen' },
    ...(screen.features || []).map(feature => ({
      value: feature.id,
      label: feature.name,
      type: 'feature',
      description: feature.description
    }))
  ]);

  const handleSearch = (inputValue: string) => {
    setSearchInput(inputValue);
    setSearchTerm(inputValue);

    if (inputValue && !options.some(opt => 
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    )) {
      setShowAddDialog(true);
    }
  };

  const downloadAsPDF = useCallback(async () => {
    const graphElement = document.querySelector('.react-flow') as HTMLElement;
    if (!graphElement) return;

    const canvas = await html2canvas(graphElement);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${searchInput || 'impact'}-analysis.pdf`);
  }, [searchInput]);

  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Select
          options={options}
          onInputChange={handleSearch}
          onChange={(option) => option && setSearchTerm(option.label)}
          className="w-full"
          classNamePrefix="react-select"
          placeholder="Search features..."
          isClearable
          isSearchable
          formatOptionLabel={(option: Option) => (
            <div>
              <div className="font-medium">{option.label}</div>
              {option.type && (
                <div className="text-xs text-gray-400 capitalize">{option.type}</div>
              )}
            </div>
          )}
        />
      </div>
      
      {searchResults.length > 0 && (
        <button
          onClick={downloadAsPDF}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </button>
      )}

      <AddFeatureDialog
        isOpen={showAddDialog}
        searchTerm={searchInput}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}