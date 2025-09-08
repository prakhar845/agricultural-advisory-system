import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { farmsAPI, cropsAPI } from '../services/api';
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Sprout, 
  Plus,
  ArrowLeft,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const FarmDetail = () => {
  const { farmId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: farm, isLoading: farmLoading } = useQuery(
    ['farm', farmId],
    () => farmsAPI.getFarm(farmId)
  );

  const { data: crops, isLoading: cropsLoading } = useQuery(
    ['farm-crops', farmId],
    () => cropsAPI.getFarmCrops(farmId)
  );

  const { data: weather, isLoading: weatherLoading } = useQuery(
    ['farm-weather', farmId],
    () => farmsAPI.getFarmWeather(farmId)
  );

  const { data: recommendations } = useQuery(
    ['farm-recommendations', farmId],
    () => farmsAPI.getFarmRecommendations(farmId)
  );

  if (farmLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">Farm not found</div>
        <Link to="/farms" className="text-green-600 hover:text-green-500">
          ← Back to Farms
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: MapPin },
    { id: 'crops', name: 'Crops', icon: Sprout },
    { id: 'weather', name: 'Weather', icon: Thermometer },
    { id: 'recommendations', name: 'Recommendations', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/farms"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Farms
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{farm.name}</h1>
            <p className="text-gray-600">
              {farm.size_acres} acres • {farm.soil_type} soil
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/farms/${farmId}/crops`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Crop
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Farm Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Farm Information</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Size</dt>
                  <dd className="text-sm text-gray-900">{farm.size_acres} acres</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Soil Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{farm.soil_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Latitude</dt>
                  <dd className="text-sm text-gray-900">{farm.latitude ? farm.latitude.toFixed(4) : 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Longitude</dt>
                  <dd className="text-sm text-gray-900">{farm.longitude ? farm.longitude.toFixed(4) : 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(farm.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sprout className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Active Crops</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {crops?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Recommendations</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {recommendations?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Current Temp</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {weather ? `${weather.temperature}°C` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crops' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Crops</h3>
                <Link
                  to={`/farms/${farmId}/crops`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Crop
                </Link>
              </div>
            </div>
            <div className="p-6">
              {cropsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : Array.isArray(crops) && crops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crops.map((crop) => (
                    <div key={crop.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{crop.crop_name}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {crop.current_stage}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Planted: {new Date(crop.planting_date).toLocaleDateString()}
                        </div>
                        <div>Area: {crop.area_planted} acres</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sprout className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No crops yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first crop.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Weather</h3>
            {weatherLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : weather ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Thermometer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{weather.temperature}°C</div>
                  <div className="text-sm text-blue-700">Temperature</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Droplets className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{weather.humidity}%</div>
                  <div className="text-sm text-green-700">Humidity</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{weather.wind_speed} m/s</div>
                  <div className="text-sm text-gray-700">Wind Speed</div>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-900">{weather.rainfall} mm</div>
                  <div className="text-sm text-cyan-700">Rainfall</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Weather data unavailable</h3>
                <p className="mt-1 text-sm text-gray-500">Unable to fetch current weather data.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
            </div>
            <div className="p-6">
              {Array.isArray(recommendations) && recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {rec.recommendation_type}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rec.status === 'applied' ? 'bg-green-100 text-green-800' :
                          rec.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Recommendations will be automatically generated based on your farm conditions, weather, and crop stages.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmDetail;
