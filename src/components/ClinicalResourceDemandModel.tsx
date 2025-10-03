import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

const ClinicalResourceDemandModel = () => {
  // State for user inputs
  const [assumptions, setAssumptions] = useState({
    q3ProjectCount: 16,
    clinicalHoursPerProject: 113,
    availabilityFactor: 50,
    maxConcurrentProjects: 3,
    workingHoursPerYear: 2080,
    safetyBufferPercent: 15,
    avgProjectDurationWeeks: 16,
    peakMonthMultiplier: 1.6,
    growthRate: 0
  });

  // Monthly distribution pattern (can be adjusted)
  const [monthlyDistribution, setMonthlyDistribution] = useState([
    { month: 'Jan', factor: 0.8 },
    { month: 'Feb', factor: 0.8 },
    { month: 'Mar', factor: 1.0 },
    { month: 'Apr', factor: 0.8 },
    { month: 'May', factor: 0.8 },
    { month: 'Jun', factor: 1.0 },
    { month: 'Jul', factor: 0.8 },
    { month: 'Aug', factor: 1.6 },
    { month: 'Sep', factor: 1.6 },
    { month: 'Oct', factor: 0.8 },
    { month: 'Nov', factor: 1.0 },
    { month: 'Dec', factor: 0.8 }
  ]);

  // Calculate results based on current assumptions
  const calculations = useMemo(() => {
    const annualProjectCount = assumptions.q3ProjectCount * 4 * (1 + assumptions.growthRate / 100);
    const totalAnnualHours = annualProjectCount * assumptions.clinicalHoursPerProject;
    const effectiveHoursPerResource = assumptions.workingHoursPerYear * (assumptions.availabilityFactor / 100);
    
    // Method 1: Hours-based
    const hoursBasedResources = Math.ceil(totalAnnualHours / effectiveHoursPerResource);
    
    // Method 2: Concurrency-based
    const avgProjectsInProgress = annualProjectCount * (assumptions.avgProjectDurationWeeks / 52);
    const concurrencyBasedResources = Math.ceil(avgProjectsInProgress / assumptions.maxConcurrentProjects);
    
    // Method 3: Peak loading
    const baseMonthlyProjects = annualProjectCount / 12;
    const peakMonthProjects = Math.ceil(baseMonthlyProjects * assumptions.peakMonthMultiplier);
    const peakBasedResources = Math.ceil((peakMonthProjects * assumptions.clinicalHoursPerProject) / (effectiveHoursPerResource / 12));
    
    // Final recommendation
    const baseRequirement = Math.max(hoursBasedResources, concurrencyBasedResources, peakBasedResources);
    const safetyBuffer = Math.ceil(baseRequirement * (assumptions.safetyBufferPercent / 100));
    const finalRecommendation = baseRequirement + safetyBuffer;

    // Monthly breakdown
    const monthlyData = monthlyDistribution.map(month => {
      const monthlyProjects = Math.round(baseMonthlyProjects * month.factor);
      const monthlyHours = monthlyProjects * assumptions.clinicalHoursPerProject;
      const monthlyResourceNeed = Math.ceil(monthlyHours / (effectiveHoursPerResource / 12));
      
      return {
        month: month.month,
        projects: monthlyProjects,
        resourcesNeeded: monthlyResourceNeed,
        hours: monthlyHours,
        recommendedStaffing: finalRecommendation
      };
    });

    return {
      annualProjectCount: Math.round(annualProjectCount),
      totalAnnualHours,
      effectiveHoursPerResource,
      hoursBasedResources,
      concurrencyBasedResources,
      peakBasedResources,
      baseRequirement,
      safetyBuffer,
      finalRecommendation,
      monthlyData,
      avgProjectsInProgress: avgProjectsInProgress.toFixed(1)
    };
  }, [assumptions, monthlyDistribution]);

  const handleAssumptionChange = (key, value) => {
    setAssumptions(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const handleMonthlyFactorChange = (monthIndex, value) => {
    setMonthlyDistribution(prev => 
      prev.map((month, index) => 
        index === monthIndex ? { ...month, factor: parseFloat(value) || 0 } : month
      )
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Clinical Resource Demand Model</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Model Assumptions</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Q3 Project Count
              </label>
              <input
                type="number"
                value={assumptions.q3ProjectCount}
                onChange={(e) => handleAssumptionChange('q3ProjectCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinical Hours per Project
              </label>
              <input
                type="number"
                value={assumptions.clinicalHoursPerProject}
                onChange={(e) => handleAssumptionChange('clinicalHoursPerProject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability Factor (%)
              </label>
              <input
                type="number"
                value={assumptions.availabilityFactor}
                onChange={(e) => handleAssumptionChange('availabilityFactor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Concurrent Projects per Resource
              </label>
              <input
                type="number"
                value={assumptions.maxConcurrentProjects}
                onChange={(e) => handleAssumptionChange('maxConcurrentProjects', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours per Year
              </label>
              <input
                type="number"
                value={assumptions.workingHoursPerYear}
                onChange={(e) => handleAssumptionChange('workingHoursPerYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Safety Buffer (%)
              </label>
              <input
                type="number"
                value={assumptions.safetyBufferPercent}
                onChange={(e) => handleAssumptionChange('safetyBufferPercent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avg Project Duration (weeks)
              </label>
              <input
                type="number"
                value={assumptions.avgProjectDurationWeeks}
                onChange={(e) => handleAssumptionChange('avgProjectDurationWeeks', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Growth Rate (%)
              </label>
              <input
                type="number"
                value={assumptions.growthRate}
                onChange={(e) => handleAssumptionChange('growthRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Monthly Distribution Factors */}
          <h3 className="text-lg font-semibold mt-6 mb-3">Monthly Distribution Factors</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {monthlyDistribution.map((month, index) => (
              <div key={month.month} className="flex items-center space-x-2">
                <label className="w-8 text-gray-700">{month.month}:</label>
                <input
                  type="number"
                  step="0.1"
                  value={month.factor}
                  onChange={(e) => handleMonthlyFactorChange(index, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {/* Summary Results */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Resource Requirement Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{calculations.finalRecommendation}</div>
                <div className="text-sm text-gray-600">Total Resources Needed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{calculations.annualProjectCount}</div>
                <div className="text-sm text-gray-600">Annual Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{calculations.totalAnnualHours.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{calculations.avgProjectsInProgress}</div>
                <div className="text-sm text-gray-600">Avg Concurrent Projects</div>
              </div>
            </div>
          </div>

          {/* Calculation Methods */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">Calculation Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded">
                <div className="font-semibold">Hours-Based</div>
                <div className="text-xl font-bold text-blue-600">{calculations.hoursBasedResources}</div>
                <div className="text-gray-600">resources</div>
              </div>
              <div className="text-center p-3 bg-white rounded">
                <div className="font-semibold">Concurrency-Based</div>
                <div className="text-xl font-bold text-green-600">{calculations.concurrencyBasedResources}</div>
                <div className="text-gray-600">resources</div>
              </div>
              <div className="text-center p-3 bg-white rounded">
                <div className="font-semibold">Peak-Load Based</div>
                <div className="text-xl font-bold text-purple-600">{calculations.peakBasedResources}</div>
                <div className="text-gray-600">resources</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">12-Month Resource Demand</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={calculations.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="projects" fill="#3B82F6" name="Monthly Projects" />
                <Line yAxisId="right" type="monotone" dataKey="resourcesNeeded" stroke="#EF4444" strokeWidth={3} name="Resources Needed" />
                <Line yAxisId="right" type="monotone" dataKey="recommendedStaffing" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Recommended Staffing" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Details Table */}
          <div className="mt-6 bg-white rounded-lg border overflow-hidden">
            <h3 className="text-lg font-semibold p-4 border-b">Monthly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Month</th>
                    <th className="px-4 py-2 text-right">Projects</th>
                    <th className="px-4 py-2 text-right">Clinical Hours</th>
                    <th className="px-4 py-2 text-right">Resources Needed</th>
                    <th className="px-4 py-2 text-right">Recommended Staffing</th>
                    <th className="px-4 py-2 text-right">Utilization %</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.monthlyData.map((month, index) => {
                    const utilization = ((month.resourcesNeeded / month.recommendedStaffing) * 100).toFixed(1);
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 font-medium">{month.month}</td>
                        <td className="px-4 py-2 text-right">{month.projects}</td>
                        <td className="px-4 py-2 text-right">{month.hours.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-semibold">{month.resourcesNeeded}</td>
                        <td className="px-4 py-2 text-right text-green-600 font-semibold">{month.recommendedStaffing}</td>
                        <td className="px-4 py-2 text-right">
                          <span className={utilization > 90 ? 'text-red-600' : utilization > 75 ? 'text-orange-600' : 'text-green-600'}>
                            {utilization}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalResourceDemandModel;