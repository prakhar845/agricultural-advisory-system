import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { cropsAPI } from '../services/api';
import { 
  Sprout, 
  Plus, 
  Calendar,
  ArrowLeft,
  Save,
  X,
  Droplets,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const Crops = () => {
  const { farmId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: crops, isLoading, error } = useQuery(
    ['farm-crops', farmId],
    () => cropsAPI.getFarmCrops(farmId)
  );
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const createCropMutation = useMutation(cropsAPI.createCrop, {
    onSuccess: () => {
      queryClient.invalidateQueries(['farm-crops', farmId]);
      queryClient.invalidateQueries('farms');
      setIsModalOpen(false);
      reset();
      toast.success('Crop added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to add crop');
    },
  });

  const onSubmit = (data) => {
    const cropData = {
      ...data,
      farm_id: parseInt(farmId),
      planting_date: new Date(data.planting_date).toISOString(),
      expected_harvest_date: data.expected_harvest_date ? new Date(data.expected_harvest_date).toISOString() : null,
    };
    createCropMutation.mutate(cropData);
  };

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
        <div className="text-red-500 text-lg">Error loading crops</div>
        <Link to="/farms" className="text-green-600 hover:text-green-500">
          ← Back to Farms
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
            to={`/farms/${farmId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Farm
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crops</h1>
            <p className="text-gray-600">Manage your crop plantings and get recommendations</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Crop
        </button>
      </div>

      {/* Crops Grid */}
      {Array.isArray(crops) && crops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <div key={crop.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Sprout className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{crop.crop_name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{crop.current_stage}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {crop.area_planted} acres
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Planted: {new Date(crop.planting_date).toLocaleDateString()}
                  </div>
                  {crop.expected_harvest_date && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Harvest: {new Date(crop.expected_harvest_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/farms/${farmId}/crops/${crop.id}/irrigation`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Droplets className="h-4 w-4 mr-2" />
                    Irrigation
                  </Link>
                  <Link
                    to={`/farms/${farmId}/crops/${crop.id}/fertilizer`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Fertilizer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sprout className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No crops yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first crop.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Crop
            </button>
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Crop</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="crop_name" className="block text-sm font-medium text-gray-700">
                  Crop Name
                </label>
                <input
                  {...register('crop_name', { required: 'Crop name is required' })}
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter crop name"
                />
                {errors.crop_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.crop_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="planting_date" className="block text-sm font-medium text-gray-700">
                  Planting Date
                </label>
                <input
                  {...register('planting_date', { required: 'Planting date is required' })}
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.planting_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.planting_date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="expected_harvest_date" className="block text-sm font-medium text-gray-700">
                  Expected Harvest Date (Optional)
                </label>
                <input
                  {...register('expected_harvest_date')}
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label htmlFor="current_stage" className="block text-sm font-medium text-gray-700">
                  Current Stage
                </label>
                <select
                  {...register('current_stage', { required: 'Current stage is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select current stage</option>
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                  <option value="fruiting">Fruiting</option>
                  <option value="harvesting">Harvesting</option>
                </select>
                {errors.current_stage && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_stage.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="area_planted" className="block text-sm font-medium text-gray-700">
                  Area Planted (acres)
                </label>
                <input
                  {...register('area_planted', { 
                    required: 'Area planted is required',
                    min: { value: 0.1, message: 'Area must be greater than 0' }
                  })}
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter area planted in acres"
                />
                {errors.area_planted && (
                  <p className="mt-1 text-sm text-red-600">{errors.area_planted.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCropMutation.isLoading}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {createCropMutation.isLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crops;
