import React from 'react';
import { ScreenForm } from './components/ScreenForm';
import { FeatureForm } from './components/FeatureForm';
import { ImpactGraph } from './components/ImpactGraph';
import { SearchBar } from './components/SearchBar';
import { AutoGenerate } from './components/AutoGenerate';
import { ScreenList } from './components/ScreenList';
import { useStore } from './store/useStore';
import { Activity, GitGraph } from 'lucide-react';

export default function App() {
  const screens = useStore((state) => state.screens);
  const selectedScreen = useStore((state) => state.selectedScreen);
  const selectedFeature = useStore((state) => state.selectedFeature);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                PlanYear Impact
              </h1>
            </div>
            <div className="w-96">
              <SearchBar />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <AutoGenerate />
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <GitGraph className="h-5 w-5 mr-2 text-indigo-600" />
                Add Screens & Features
              </h2>
              <ScreenForm />
              {selectedScreen && <FeatureForm />}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Screen & Feature Tree</h3>
              <ScreenList />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-base font-medium mb-4">Universe</h2>
              <ImpactGraph />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}