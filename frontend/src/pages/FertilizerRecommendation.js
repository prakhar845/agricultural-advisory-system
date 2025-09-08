import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { cropsAPI } from '../services/api';
import { 
  ArrowLeft,
  Package,
  Calendar,
  TrendingUp,
  AlertCircle,
  Leaf,
  Zap,
  Droplets
} from 'lucide-react';

const FertilizerRecommendation = () => {
  const { farmId, cropId } = useParams();

  const { data: recommendation, isLoading, error } = useQuery(
    ['fertilizer-recommendation', farmId, cropId],
    () => cropsAPI.getFertilizerRecommendation(farmId, cropId)
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
        <div className="text-red-500 text-lg">Error loading fertilizer recommendation</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Fertilizer Recommendation</h1>
            <p className="text-gray-600">AI-powered fertilizer guidance for optimal crop nutrition</p>
          </div>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Package className="h-8 w-8 text-green-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Fertilizer Plan</h2>
        </div>

        {recommendation ? (
          <div className="space-y-6">
            {/* Fertilizer Type */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Leaf className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-sm font-medium text-green-900">Recommended Fertilizer</h3>
              </div>
              <div className="text-xl font-bold text-green-900">
                {recommendation.fertilizer_type}
              </div>
              <p className="text-sm text-green-700">Best for current soil conditions</p>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-900">Amount</h3>
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {recommendation.amount_per_acre} kg/acre
                </div>
                <p className="text-sm text-blue-700">per application</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-sm font-medium text-orange-900">Timing</h3>
                </div>
                <div className="text-lg font-bold text-orange-900 capitalize">
                  {recommendation.timing}
                </div>
                <p className="text-sm text-orange-700">application schedule</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Zap className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-medium text-purple-900">Method</h3>
                </div>
                <div className="text-lg font-bold text-purple-900 capitalize">
                  {recommendation.application_method}
                </div>
                <p className="text-sm text-purple-700">application technique</p>
              </div>
            </div>

            {/* NPK Analysis */}
            {recommendation.npk_analysis && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">NPK Analysis</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">N</div>
                    <div className="text-sm text-gray-600">Nitrogen</div>
                    <div className="text-lg font-semibold">{recommendation.npk_analysis.nitrogen}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">P</div>
                    <div className="text-sm text-gray-600">Phosphorus</div>
                    <div className="text-lg font-semibold">{recommendation.npk_analysis.phosphorus}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">K</div>
                    <div className="text-sm text-gray-600">Potassium</div>
                    <div className="text-lg font-semibold">{recommendation.npk_analysis.potassium}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Reasoning */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendation Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {recommendation.reason}
                </p>
              </div>
            </div>

            {/* Application Tips */}
            {recommendation.application_tips && recommendation.application_tips.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Tips</h3>
                <ul className="space-y-2">
                  {recommendation.application_tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendation available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Fertilizer recommendations will appear here based on your crop and soil data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilizerRecommendation;
