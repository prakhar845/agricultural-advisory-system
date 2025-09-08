import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { cropsAPI, farmsAPI } from '../services/api';
import { 
  ArrowLeft,
  Camera,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const DiseaseDetection = () => {
  const { farmId } = useParams();
  const [selectedCrop, setSelectedCrop] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const queryClient = useQueryClient();

  const { data: crops, isLoading: cropsLoading } = useQuery(
    ['farm-crops', farmId],
    () => cropsAPI.getFarmCrops(farmId)
  );

  const { data: diseaseHistory, isLoading: historyLoading } = useQuery(
    ['disease-history', farmId],
    () => farmsAPI.getDiseaseHistory(farmId)
  );

  const detectDiseaseMutation = useMutation(
    ({ farmId, cropId, imageFile }) => cropsAPI.detectDisease(farmId, cropId, imageFile),
    {
      onSuccess: (data) => {
        setDetectionResult(data);
        queryClient.invalidateQueries(['disease-history', farmId]);
        toast.success('Disease detection completed!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to detect disease');
      },
      onSettled: () => {
        setIsDetecting(false);
      },
    }
  );

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(file);
      setDetectionResult(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDetectDisease = () => {
    if (!uploadedImage || !selectedCrop) {
      toast.error('Please select a crop and upload an image');
      return;
    }

    setIsDetecting(true);
    detectDiseaseMutation.mutate({
      farmId: parseInt(farmId),
      cropId: parseInt(selectedCrop),
      imageFile: uploadedImage,
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
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
            <h1 className="text-3xl font-bold text-gray-900">Disease Detection</h1>
            <p className="text-gray-600">Upload crop images to detect diseases and get treatment recommendations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Interface */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detect Disease</h3>
          
          {/* Crop Selection */}
          <div className="mb-4">
            <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-2">
              Select Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Choose a crop</option>
              {crops?.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.crop_name} ({crop.current_stage})
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {uploadedImage ? (
                <div className="space-y-2">
                  <ImageIcon className="mx-auto h-12 w-12 text-green-600" />
                  <p className="text-sm text-gray-900">{uploadedImage.name}</p>
                  <p className="text-xs text-gray-500">
                    {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports: JPG, PNG, GIF, BMP, WebP (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detect Button */}
          <button
            onClick={handleDetectDisease}
            disabled={!uploadedImage || !selectedCrop || isDetecting}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDetecting ? (
              <>
                <div className="spinner mr-2"></div>
                Detecting...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Detect Disease
              </>
            )}
          </button>
        </div>

        {/* Detection Results */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detection Results</h3>
          
          {detectionResult ? (
            <div className="space-y-4">
              {/* Disease Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900">
                    {detectionResult.disease_name}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(detectionResult.severity)}`}>
                    {detectionResult.severity} severity
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`font-medium ${getConfidenceColor(detectionResult.confidence)}`}>
                    Confidence: {(detectionResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Treatment Recommendations */}
              {detectionResult.treatment_recommendations && detectionResult.treatment_recommendations.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                    Treatment Recommendations
                  </h5>
                  <ul className="space-y-1">
                    {detectionResult.treatment_recommendations.map((treatment, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {treatment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prevention Tips */}
              {detectionResult.prevention_tips && detectionResult.prevention_tips.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Prevention Tips
                  </h5>
                  <ul className="space-y-1">
                    {detectionResult.prevention_tips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No detection yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload an image and select a crop to detect diseases.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disease History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Detection History
          </h3>
        </div>
        <div className="p-6">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : Array.isArray(diseaseHistory) && diseaseHistory.length > 0 ? (
            <div className="space-y-4">
              {diseaseHistory.map((detection) => (
                <div key={detection.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {detection.predicted_disease}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(detection.detection_date).toLocaleDateString()}
                          </span>
                          <span className={`font-medium ${getConfidenceColor(detection.confidence_score)}`}>
                            {(detection.confidence_score * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        detection.confidence_score >= 0.8 ? 'bg-green-100 text-green-800' :
                        detection.confidence_score >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {detection.confidence_score >= 0.8 ? 'High' :
                         detection.confidence_score >= 0.6 ? 'Medium' : 'Low'} Confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No detection history</h3>
              <p className="mt-1 text-sm text-gray-500">
                Disease detection results will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
