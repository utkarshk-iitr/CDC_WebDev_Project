'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  productBasicInfoSchema,
  productPricingSchema,
  productDetailsSchema,
  ProductBasicInfoInput,
  ProductPricingInput,
  ProductDetailsInput,
} from '@/lib/validations';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Basic Info', description: 'Product name and description' },
  { id: 2, name: 'Pricing', description: 'Price, stock, and SKU' },
  { id: 3, name: 'Images', description: 'Upload product images' },
  { id: 4, name: 'Status', description: 'Publication status' },
];

const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Other'];

interface UploadedImage {
  url: string;
  publicId: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Form for step 1
  const basicInfoForm = useForm<ProductBasicInfoInput>({
    resolver: zodResolver(productBasicInfoSchema),
    defaultValues: formData,
  });

  // Form for step 2
  const pricingForm = useForm<ProductPricingInput>({
    resolver: zodResolver(productPricingSchema),
    defaultValues: formData,
  });

  // Form for step 4
  const detailsForm = useForm<ProductDetailsInput>({
    resolver: zodResolver(productDetailsSchema),
    defaultValues: { status: formData.status || 'draft' },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create product');
      }
      return res.json();
    },
    onSuccess: () => {
      router.push('/dashboard/products');
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const handleNext = async () => {
    if (currentStep === 1) {
      const valid = await basicInfoForm.trigger();
      if (valid) {
        setFormData({ ...formData, ...basicInfoForm.getValues() });
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const valid = await pricingForm.trigger();
      if (valid) {
        setFormData({ ...formData, ...pricingForm.getValues() });
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    const valid = await detailsForm.trigger();
    if (valid) {
      const finalData = {
        ...formData,
        ...detailsForm.getValues(),
        images,
      };
      createMutation.mutate(finalData);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        setImages((prev) => [...prev, data]);
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (publicId: string) => {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 mt-1">Create a new product in your inventory</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium',
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <div className="hidden sm:block mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{step.name}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 sm:w-24 h-1 mx-2',
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="card">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                {...basicInfoForm.register('name')}
                className="input-field"
                placeholder="Enter product name"
              />
              {basicInfoForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {basicInfoForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...basicInfoForm.register('description')}
                rows={4}
                className="input-field"
                placeholder="Enter product description"
              />
              {basicInfoForm.formState.errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {basicInfoForm.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select {...basicInfoForm.register('category')} className="input-field">
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {basicInfoForm.formState.errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {basicInfoForm.formState.errors.category.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Pricing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                {...pricingForm.register('price', { valueAsNumber: true })}
                className="input-field"
                placeholder="0.00"
              />
              {pricingForm.formState.errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {pricingForm.formState.errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                {...pricingForm.register('stock', { valueAsNumber: true })}
                className="input-field"
                placeholder="0"
              />
              {pricingForm.formState.errors.stock && (
                <p className="mt-1 text-sm text-red-600">
                  {pricingForm.formState.errors.stock.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input
                type="text"
                {...pricingForm.register('sku')}
                className="input-field uppercase"
                placeholder="PROD-001"
              />
              {pricingForm.formState.errors.sku && (
                <p className="mt-1 text-sm text-red-600">
                  {pricingForm.formState.errors.sku.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Images */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploading ? (
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400" />
                  )}
                  <p className="mt-2 text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </label>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.publicId} className="relative group">
                    <Image
                      src={image.url}
                      alt="Product"
                      width={150}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(image.publicId)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <ImageIcon className="w-4 h-4" />
                No images uploaded yet (optional)
              </div>
            )}
          </div>
        )}

        {/* Step 4: Status */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Publication Status *
              </label>
              <div className="space-y-3">
                {[
                  { value: 'draft', label: 'Draft', description: 'Save as draft, not visible to customers' },
                  { value: 'active', label: 'Active', description: 'Publish and make visible to customers' },
                  { value: 'inactive', label: 'Inactive', description: 'Hidden from customers but saved' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-start p-4 border rounded-lg cursor-pointer transition-colors',
                      detailsForm.watch('status') === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      {...detailsForm.register('status')}
                      value={option.value}
                      className="mt-1"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Product Summary</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Name:</dt>
                  <dd className="font-medium text-gray-900">{formData.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Category:</dt>
                  <dd className="font-medium text-gray-900">{formData.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Price:</dt>
                  <dd className="font-medium text-gray-900">${formData.price}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Stock:</dt>
                  <dd className="font-medium text-gray-900">{formData.stock}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">SKU:</dt>
                  <dd className="font-medium text-gray-900">{formData.sku?.toUpperCase()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Images:</dt>
                  <dd className="font-medium text-gray-900">{images.length} uploaded</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
