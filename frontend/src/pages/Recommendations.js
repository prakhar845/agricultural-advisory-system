import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { farmsAPI } from '../services/api';
import { 
  ArrowLeft,
  TrendingUp,
  Droplets,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const Recommendations = () => {
  const { farmId } = useParams();

  const { data: recommendations, isLoading, error } = useQuery(
    ['farm-recommendations', farmId],
    () => farmsAPI.getFarmRecommendations(farmId)
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
        <div className="text-red-500 text-lg">Error loading recommendations</div>
        <Link to={`/farms/${farmId}`} className="text-green-600 hover:text-green-500">
          ← Back to Farm
        </Link>
      </div>
    );
  }

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'irrigation':
        return <Droplets className="h-5 w-5 text-blue-600" />;
      case 'fertilizer':
        return <Package className="h-5 w-5 text-green-600" />;
      case 'pest_control':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'dismissed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/farms/${farmId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Farm
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recommendations</h1>
            <p className="text-gray-600">Personalized agricultural recommendations for your farm</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{recommendations?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Array.isArray(recommendations) ? recommendations.filter(r => r.status === 'pending').length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Applied</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Array.isArray(recommendations) ? recommendations.filter(r => r.status === 'applied').length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Urgent</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Array.isArray(recommendations) ? recommendations.filter(r => r.priority === 'urgent').length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Recommendations</h3>
        </div>
        <div className="p-6">
          {Array.isArray(recommendations) && recommendations.length > 0 ? (
            <div className="space-y-6">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getRecommendationIcon(recommendation.recommendation_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {recommendation.title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                            {recommendation.priority} priority
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{recommendation.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {recommendation.recommendation_type.replace('_', ' ')}
                          </span>
                          <span>
                            Created: {new Date(recommendation.created_at).toLocaleDateString()}
                          </span>
                          {recommendation.updated_at && (
                            <span>
                              Updated: {new Date(recommendation.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(recommendation.status)}
                      <span className={`text-sm font-medium ${
                        recommendation.status === 'applied' ? 'text-green-600' :
                        recommendation.status === 'dismissed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {recommendation.status}
                      </span>
                    </div>
                  </div>
                  
                  {recommendation.status === 'pending' && (
                    <div className="mt-4 flex space-x-3">
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Applied
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <XCircle className="h-4 w-4 mr-2" />
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add crops to your farm to get personalized recommendations.
              </p>
              <div className="mt-6">
                <Link
                  to={`/farms/${farmId}/crops`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Add Crops
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
