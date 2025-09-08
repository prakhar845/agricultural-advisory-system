import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { cropsAPI } from '../services/api';
import { 
  ArrowLeft,
  Droplets,
  Clock,
  Thermometer,
  Cloud,
  Wind,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const IrrigationRecommendation = () => {
  const { farmId, cropId } = useParams();

  const { data: recommendation, isLoading, error } = useQuery(
    ['irrigation-recommendation', farmId, cropId],
    () => cropsAPI.getIrrigationRecommendation(farmId, cropId)
  );

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
        <div className="text-red-500 text-lg">Error loading irrigation recommendation</div>
        <Link to={`/farms/${farmId}/crops`} className="text-green-600 hover:text-green-500">
          ← Back to Crops
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/farms/${farmId}/crops`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Crops
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Irrigation Recommendation</h1>
            <p className="text-gray-600">AI-powered irrigation guidance for optimal crop growth</p>
          </div>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Droplets className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Irrigation Plan</h2>
        </div>

        {recommendation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Water Amount */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Droplets className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-blue-900">Water Amount</h3>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {recommendation.recommended_water_amount}L
              </div>
              <p className="text-sm text-blue-700">per application</p>
            </div>

            {/* Frequency */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-sm font-medium text-green-900">Frequency</h3>
              </div>
              <div className="text-2xl font-bold text-green-900 capitalize">
                {recommendation.frequency}
              </div>
              <p className="text-sm text-green-700">irrigation schedule</p>
            </div>

            {/* Best Time */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Thermometer className="h-6 w-6 text-orange-600 mr-2" />
                <h3 className="text-sm font-medium text-orange-900">Best Time</h3>
              </div>
              <div className="text-2xl font-bold text-orange-900 capitalize">
                {recommendation.best_time}
              </div>
              <p className="text-sm text-orange-700">for irrigation</p>
            </div>

            {/* Status */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-sm font-medium text-purple-900">Status</h3>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                Optimal
              </div>
              <p className="text-sm text-purple-700">conditions</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendation available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Irrigation recommendations will appear here based on your crop and weather data.
            </p>
          </div>
        )}

        {/* Detailed Reasoning */}
        {recommendation && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendation Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {recommendation.reason}
              </p>
            </div>
          </div>
        )}

        {/* Weather Considerations */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weather Considerations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Cloud className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Rainfall</p>
                <p className="text-sm text-gray-500">Monitor precipitation</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Thermometer className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Temperature</p>
                <p className="text-sm text-gray-500">Adjust for heat stress</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Wind className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Wind Speed</p>
                <p className="text-sm text-gray-500">Consider evaporation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationRecommendation;
