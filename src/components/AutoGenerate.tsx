import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as XLSX from 'xlsx';

export function AutoGenerate() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addScreen = useStore((state) => state.addScreen);

  const processExcel = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON maintaining empty cells
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as (string | null)[][];

      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least headers and one row of data');
      }

      // First row contains screen names (column headers)
      const screenNames = jsonData[0].filter((name): name is string => 
        typeof name === 'string' && name.trim() !== ''
      );

      // Create a map to store features for each screen
      const screenFeatures = new Map<string, string[]>();

      // Initialize the map with empty arrays for each screen
      screenNames.forEach(name => {
        screenFeatures.set(name, []);
      });

      // Process features (remaining rows)
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        screenNames.forEach((screenName, colIndex) => {
          const feature = row[colIndex];
          if (feature && typeof feature === 'string' && feature.trim() !== '') {
            screenFeatures.get(screenName)?.push(feature.trim());
          }
        });
      }

      // Create screens with their features
      screenFeatures.forEach((features, screenName) => {
        const screenId = crypto.randomUUID();
        addScreen({
          id: screenId,
          name: screenName.trim(),
          features: features.map(featureName => ({
            id: crypto.randomUUID(),
            name: featureName,
            description: '',
            connections: []
          }))
        });
      });

      setIsProcessing(false);
    } catch (err) {
      console.error('Error processing Excel file:', err);
      setError('Failed to process Excel file. Please ensure it\'s properly formatted.');
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const validateAndProcessFile = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (!validTypes.includes(file.type)) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    processExcel(file);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Upload className="h-5 w-5 mr-2 text-indigo-600" />
        Auto Generate
      </h2>

      <div className="space-y-4">
        <div 
          className={`relative flex items-center justify-center w-full ${
            dragActive ? 'border-indigo-600' : 'border-gray-300'
          } border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleFileSelect}
        >
          <div className="flex flex-col items-center justify-center py-6 px-4">
            {isProcessing ? (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Processing...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}