import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Screen, Feature } from '../types';
import { Plus, Pencil, X } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export function ScreenForm() {
  const [name, setName] = useState('');
  const [features, setFeatures] = useState<Omit<Feature, 'id' | 'connections'>[]>([
    { name: '', description: '' }
  ]);
  const [editMode, setEditMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const addScreen = useStore((state) => state.addScreen);
  const updateScreen = useStore((state) => state.updateScreen);
  const selectedScreen = useStore((state) => state.selectedScreen);
  const removeScreen = useStore((state) => state.removeScreen);
  const removeFeature = useStore((state) => state.removeFeature);

  useEffect(() => {
    if (selectedScreen) {
      setName(selectedScreen.name || '');
      setFeatures(selectedScreen.features?.map(({ name, description }) => ({ 
        name: name || '', 
        description: description || '' 
      })) || [{ name: '', description: '' }]);
      setEditMode(true);
    } else {
      resetForm();
    }
  }, [selectedScreen]);

  const resetForm = () => {
    setName('');
    setFeatures([{ name: '', description: '' }]);
    setEditMode(false);
  };

  const handleAddFeature = () => {
    setFeatures(prev => [...prev, { name: '', description: '' }]);
  };

  const handleRemoveFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFeatureChange = (index: number, field: 'name' | 'description', value: string) => {
    setFeatures(prev => prev.map((feature, i) => 
      i === index ? { ...feature, [field]: value } : feature
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editMode && selectedScreen) {
      updateScreen(selectedScreen.id, name);
      setEditMode(false);
    } else {
      const newFeatures: Feature[] = features
        .filter(f => f.name.trim())
        .map(f => ({
          ...f,
          id: crypto.randomUUID(),
          connections: []
        }));

      const newScreen: Screen = {
        id: crypto.randomUUID(),
        name,
        features: newFeatures,
      };
      addScreen(newScreen);
    }
    resetForm();
  };

  const handleCancel = () => {
    if (name.trim() || features.some(f => f.name.trim() || f.description.trim())) {
      setShowCancelDialog(true);
    } else {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="screenName" className="block text-sm font-medium text-gray-700">
          Screen Name
        </label>
        <input
          type="text"
          id="screenName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter screen name"
        />
      </div>

      {features.map((feature, index) => (
        <div key={`feature-${index}`} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Feature {index + 1}
            </label>
            {features.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveFeature(index)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={feature.name}
            onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Feature name"
          />
          <textarea
            value={feature.description}
            onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
            rows={2}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Feature description"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddFeature}
        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Feature
      </button>

      <div className="flex justify-end space-x-2">
        {editMode && (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          {editMode ? (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Update
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Screen
            </>
          )}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancel Changes"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        onConfirm={() => {
          setShowCancelDialog(false);
          resetForm();
        }}
        onCancel={() => setShowCancelDialog(false)}
      />
    </form>
  );
}