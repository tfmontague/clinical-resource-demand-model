import React from 'react';
import ClinicalResourceDemandModel from './components/ClinicalResourceDemandModel';
import logo from './assets/amn_healthcare_logo.jpg';

const App = () => {
  return (
    <div>
      <header className="bg-white shadow p-4 flex items-center space-x-4">
        <img src={logo} alt="AMN Healthcare Logo" className="h-12 w-auto" />
        <h1 className="text-2xl font-bold text-gray-800">AMN Healthcare: Clinical Resource Demand Model</h1>
      </header>
      <main className="py-6">
        <ClinicalResourceDemandModel />
      </main>
    </div>
  );
};

export default App;
