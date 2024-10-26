import { create } from 'zustand';
import { Screen, Feature, SearchResult } from '../types';

interface Store {
  screens: Screen[];
  selectedScreen: Screen | null;
  selectedFeature: Feature | null;
  searchTerm: string;
  searchResults: SearchResult[];
  addScreen: (screen: Screen) => void;
  updateScreen: (screenId: string, name: string) => void;
  removeScreen: (screenId: string) => void;
  addFeature: (screenId: string, feature: Feature) => void;
  updateFeature: (screenId: string, featureId: string, name: string, description: string) => void;
  removeFeature: (screenId: string, featureId: string) => void;
  addConnection: (featureId: string, targetFeatureId: string) => void;
  setSelectedScreen: (screen: Screen | null) => void;
  setSelectedFeature: (feature: Feature | null) => void;
  setSearchTerm: (term: string) => void;
}

export const useStore = create<Store>((set, get) => ({
  screens: [],
  selectedScreen: null,
  selectedFeature: null,
  searchTerm: '',
  searchResults: [],
  
  addScreen: (screen) =>
    set((state) => ({ screens: [...state.screens, screen] })),
    
  updateScreen: (screenId, name) =>
    set((state) => ({
      screens: state.screens.map((screen) =>
        screen.id === screenId ? { ...screen, name } : screen
      ),
    })),

  removeScreen: (screenId) =>
    set((state) => ({
      screens: state.screens.filter((screen) => screen.id !== screenId),
      selectedScreen: state.selectedScreen?.id === screenId ? null : state.selectedScreen,
      selectedFeature: state.selectedFeature && 
        state.screens.find(s => s.id === screenId)?.features.find(f => f.id === state.selectedFeature?.id) 
        ? null 
        : state.selectedFeature,
    })),
    
  addFeature: (screenId, feature) =>
    set((state) => ({
      screens: state.screens.map((screen) =>
        screen.id === screenId
          ? { ...screen, features: [...screen.features, feature] }
          : screen
      ),
    })),

  updateFeature: (screenId, featureId, name, description) =>
    set((state) => ({
      screens: state.screens.map((screen) =>
        screen.id === screenId
          ? {
              ...screen,
              features: screen.features.map((feature) =>
                feature.id === featureId
                  ? { ...feature, name, description }
                  : feature
              ),
            }
          : screen
      ),
    })),

  removeFeature: (screenId, featureId) =>
    set((state) => ({
      screens: state.screens.map((screen) =>
        screen.id === screenId
          ? {
              ...screen,
              features: screen.features.filter((feature) => feature.id !== featureId),
            }
          : screen
      ),
      selectedFeature: state.selectedFeature?.id === featureId ? null : state.selectedFeature,
    })),
    
  addConnection: (featureId, targetFeatureId) =>
    set((state) => ({
      screens: state.screens.map((screen) => ({
        ...screen,
        features: screen.features.map((feature) =>
          feature.id === featureId
            ? {
                ...feature,
                connections: [...feature.connections, targetFeatureId],
              }
            : feature
        ),
      })),
    })),
    
  setSelectedScreen: (screen) => set({ selectedScreen: screen }),
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  
  setSearchTerm: (term) => {
    const searchTerm = term.toLowerCase();
    const { screens } = get();
    
    if (!Array.isArray(screens) || screens.length === 0) {
      set({ searchTerm: term, searchResults: [] });
      return;
    }

    const results: SearchResult[] = screens
      .map(screen => {
        if (!screen || !Array.isArray(screen.features)) {
          return { screenId: screen.id, featureIds: [] };
        }

        const matchingFeatures = screen.features.filter(feature => 
          feature && (
            feature.name.toLowerCase().includes(searchTerm) ||
            (feature.description && feature.description.toLowerCase().includes(searchTerm))
          )
        );

        return {
          screenId: screen.id,
          featureIds: matchingFeatures.map(f => f.id)
        };
      })
      .filter(result => result.featureIds.length > 0);

    set({ searchTerm: term, searchResults: results });
  },
}));