import React from 'react';
import { useStore } from '../store/useStore';
import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export function ScreenList() {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string, type: 'screen' | 'feature' } | null>(null);

  const screens = useStore((state) => state.screens);
  const selectedScreen = useStore((state) => state.selectedScreen);
  const selectedFeature = useStore((state) => state.selectedFeature);
  const setSelectedScreen = useStore((state) => state.setSelectedScreen);
  const setSelectedFeature = useStore((state) => state.setSelectedFeature);
  const removeScreen = useStore((state) => state.removeScreen);
  const removeFeature = useStore((state) => state.removeFeature);

  const handleDelete = (type: 'screen' | 'feature', id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'screen') {
      removeScreen(deleteTarget.id);
      setSelectedScreen(null);
    } else if (selectedScreen) {
      removeFeature(selectedScreen.id, deleteTarget.id);
      setSelectedFeature(null);
    }
    
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  if (!Array.isArray(screens) || screens.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No screens added yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {screens.map((screen, index) => {
        if (!screen || !screen.id) return null;
        
        return (
          <div key={screen.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedScreen(screen)}
                className={`flex-1 text-left px-3 py-2 rounded-md text-sm ${
                  selectedScreen?.id === screen.id
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                {screen.name}
              </button>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSelectedScreen(screen)}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete('screen', screen.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {selectedScreen?.id === screen.id && Array.isArray(screen.features) && screen.features.map((feature, featureIndex) => {
              if (!feature || !feature.id) return null;
              
              return (
                <div key={`${screen.id}-${feature.id}`} className="ml-4 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedFeature(feature)}
                    className={`flex-1 text-left px-3 py-1 rounded-md text-xs ${
                      selectedFeature?.id === feature.id
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {feature.name}
                  </button>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedScreen(screen);
                        setSelectedFeature(feature);
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete('feature', feature.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={`Delete ${deleteTarget?.type === 'screen' ? 'Screen' : 'Feature'}`}
        message={`Are you sure you want to delete this ${deleteTarget?.type}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}