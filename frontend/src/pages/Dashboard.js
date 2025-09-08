import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { farmsAPI } from '../services/api';
import { 
  MapPin, 
  Sprout, 
  Droplets, 
  Thermometer, 
  TrendingUp,
  AlertCircle,
  Plus,
  RefreshCw,
  Package
} from 'lucide-react';

const Dashboard = () => {
  const { data: farms, isLoading, error, refetch } = useQuery('farms', farmsAPI.getFarms, {
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading farms</h3>
        <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  // Ensure farms is always an array
  const farmsList = Array.isArray(farms) ? farms : [];
  const totalFarms = farmsList.length;
  const totalCrops = farmsList.reduce((sum, farm) => sum + (farm.crops?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your agricultural advisory system</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/farms"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Farm
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Farms</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalFarms}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Crops</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalCrops}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Droplets className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Irrigation</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalCrops}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recommendations</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalCrops}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Farms */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Farms</h3>
          {farmsList.length > 0 ? (
            <div className="space-y-4">
              {farmsList.slice(0, 3).map((farm) => (
                <div key={farm.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{farm.name}</h4>
                      <p className="text-sm text-gray-500">
                        {farm.size_acres} acres • {farm.soil_type} soil
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/farms/${farm.id}`}
                    className="text-green-600 hover:text-green-500 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No farms yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first farm.</p>
              <div className="mt-6">
                <Link
                  to="/farms"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Farm
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Crops and Recommendations */}
      {totalCrops > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Crops & Recommendations</h3>
            <div className="space-y-4">
              {farmsList.slice(0, 2).map((farm) => (
                farm.crops && farm.crops.length > 0 && (
                  <div key={farm.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">{farm.name}</h4>
                      <span className="text-xs text-gray-500">{farm.crops.length} crops</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {farm.crops.slice(0, 2).map((crop) => (
                        <div key={crop.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-900">{crop.crop_name}</h5>
                            <span className="text-xs text-gray-500 capitalize">{crop.current_stage}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/farms/${farm.id}/crops/${crop.id}/irrigation`}
                              className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Droplets className="h-3 w-3 mr-1" />
                              Irrigation
                            </Link>
                            <Link
                              to={`/farms/${farm.id}/crops/${crop.id}/fertilizer`}
                              className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Package className="h-3 w-3 mr-1" />
                              Fertilizer
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/farms"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Manage Farms</h4>
                <p className="text-sm text-gray-500">Add or update farm information</p>
              </div>
            </Link>

            <Link
              to="/farms"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Sprout className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Add Crops</h4>
                <p className="text-sm text-gray-500">Register new crop plantings</p>
              </div>
            </Link>

            <Link
              to="/farms"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Thermometer className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Check Weather</h4>
                <p className="text-sm text-gray-500">View current weather conditions</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
