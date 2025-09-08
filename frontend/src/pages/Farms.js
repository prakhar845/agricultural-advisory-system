import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { farmsAPI } from '../services/api';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Farms = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: farms, isLoading, error, refetch } = useQuery('farms', farmsAPI.getFarms, {
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const createFarmMutation = useMutation(farmsAPI.createFarm, {
    onSuccess: () => {
      queryClient.invalidateQueries(['farms']);
      queryClient.invalidateQueries('farms');
      setIsModalOpen(false);
      reset();
      toast.success('Farm created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create farm');
    },
  });

  const updateFarmMutation = useMutation(
    ({ farmId, farmData }) => farmsAPI.updateFarm(farmId, farmData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['farms']);
        queryClient.invalidateQueries('farms');
        setIsEditModalOpen(false);
        setEditingFarm(null);
        reset();
        toast.success('Farm updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update farm');
      },
    }
  );

  const onSubmit = (data) => {
    createFarmMutation.mutate(data);
  };

  const onEditSubmit = (data) => {
    updateFarmMutation.mutate({ farmId: editingFarm.id, farmData: data });
  };

  const handleEditFarm = (farm) => {
    setEditingFarm(farm);
    setValue('name', farm.name);
    setValue('size_acres', farm.size_acres);
    setValue('soil_type', farm.soil_type);
    setValue('latitude', farm.latitude);
    setValue('longitude', farm.longitude);
    setIsEditModalOpen(true);
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
        <div className="text-red-500 text-lg">Error loading farms</div>
        <p className="text-gray-500">Please try again later.</p>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
          <p className="text-gray-600">Manage your farm properties and get personalized recommendations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Farm
          </button>
        </div>
      </div>

      {/* Farms Grid */}
      {farmsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmsList.map((farm) => (
            <div key={farm.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{farm.name}</h3>
                    <p className="text-sm text-gray-500">{farm.location || 'Location not specified'}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium">{farm.size_acres} acres</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Soil Type:</span>
                    <span className="font-medium capitalize">{farm.soil_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Coordinates:</span>
                    <span className="font-medium text-xs">
                      {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Link
                    to={`/farms/${farm.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                  <button 
                    onClick={() => handleEditFarm(farm)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No farms yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first farm.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Farm
            </button>
          </div>
        </div>
      )}

      {/* Add Farm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Farm</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Farm Name
                </label>
                <input
                  {...register('name', { required: 'Farm name is required' })}
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter farm name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="size_acres" className="block text-sm font-medium text-gray-700">
                  Size (acres)
                </label>
                <input
                  {...register('size_acres', { 
                    required: 'Size is required',
                    min: { value: 0.1, message: 'Size must be greater than 0' }
                  })}
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter farm size in acres"
                />
                {errors.size_acres && (
                  <p className="mt-1 text-sm text-red-600">{errors.size_acres.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="soil_type" className="block text-sm font-medium text-gray-700">
                  Soil Type
                </label>
                <select
                  {...register('soil_type', { required: 'Soil type is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select soil type</option>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="clay">Clay</option>
                  <option value="silty">Silty</option>
                </select>
                {errors.soil_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.soil_type.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  {...register('latitude', { 
                    required: 'Latitude is required',
                    min: { value: -90, message: 'Invalid latitude' },
                    max: { value: 90, message: 'Invalid latitude' }
                  })}
                  type="number"
                  step="any"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter latitude"
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  {...register('longitude', { 
                    required: 'Longitude is required',
                    min: { value: -180, message: 'Invalid longitude' },
                    max: { value: 180, message: 'Invalid longitude' }
                  })}
                  type="number"
                  step="any"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter longitude"
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
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
                  disabled={createFarmMutation.isLoading}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {createFarmMutation.isLoading ? (
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

      {/* Edit Farm Modal */}
      {isEditModalOpen && editingFarm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Farm</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingFarm(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Farm Name
                </label>
                <input
                  {...register('name', { required: 'Farm name is required' })}
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter farm name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="size_acres" className="block text-sm font-medium text-gray-700">
                  Size (acres)
                </label>
                <input
                  {...register('size_acres', { 
                    required: 'Size is required',
                    min: { value: 0.1, message: 'Size must be greater than 0' }
                  })}
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter farm size in acres"
                />
                {errors.size_acres && (
                  <p className="mt-1 text-sm text-red-600">{errors.size_acres.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="soil_type" className="block text-sm font-medium text-gray-700">
                  Soil Type
                </label>
                <select
                  {...register('soil_type', { required: 'Soil type is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select soil type</option>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="clay">Clay</option>
                  <option value="silty">Silty</option>
                </select>
                {errors.soil_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.soil_type.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  {...register('latitude', { 
                    required: 'Latitude is required',
                    min: { value: -90, message: 'Invalid latitude' },
                    max: { value: 90, message: 'Invalid latitude' }
                  })}
                  type="number"
                  step="any"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter latitude"
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  {...register('longitude', { 
                    required: 'Longitude is required',
                    min: { value: -180, message: 'Invalid longitude' },
                    max: { value: 180, message: 'Invalid longitude' }
                  })}
                  type="number"
                  step="any"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter longitude"
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingFarm(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateFarmMutation.isLoading}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {updateFarmMutation.isLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update
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

export default Farms;
