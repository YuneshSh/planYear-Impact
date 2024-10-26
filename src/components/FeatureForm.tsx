import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Feature } from '../types';
import { Plus, Pencil } from 'lucide-react';

export function FeatureForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  
  const selectedScreen = useStore((state) => state.selectedScreen);
  const selectedFeature = useStore((state) => state.selectedFeature);
  const addFeature = useStore((state) => state.addFeature);
  const updateFeature = useStore((state) => state.updateFeature);

  useEffect(() => {
    if (selectedScreen) {
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  }, [selectedScreen]);

  useEffect(() => {
    if (selectedFeature && editMode) {
      setName(selectedFeature.name);
      setDescription(selectedFeature.description);
    }
  }, [selectedFeature, editMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedScreen) return;

    if (editMode && selectedFeature) {
      updateFeature(selectedScreen.id, selectedFeature.id, name, description);
      setEditMode(false);
    } else {
      const newFeature: Feature = {
        id: crypto.randomUUID(),
        name,
        description,
        connections: [],
      };
      addFeature(selectedScreen.id, newFeature);
    }
    setName('');
    setDescription('');
  };

  const startEdit = () => {
    if (selectedFeature) {
      setName(selectedFeature.name);
      setDescription(selectedFeature.description);
      setEditMode(true);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setName('');
    setDescription('');
  };

  if (!isEnabled) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="featureName" className="block text-sm font-medium text-gray-700">
          Feature Name
        </label>
        <input
          type="text"
          id="featureName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter feature name"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter feature description"
        />
      </div>
      <div className="flex space-x-2">
        {editMode ? (
          <>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Update Feature
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="submit"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </button>
        )}
        {selectedFeature && !editMode && (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}