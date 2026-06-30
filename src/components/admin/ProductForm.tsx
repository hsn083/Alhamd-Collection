'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Check, X } from 'lucide-react';

const categories = [
  "Men's Clothing",
  "Women's Clothing",
  'Shoes',
  'Accessories',
];

const brands = [
  'AlhamdCollection',
  'Premium Wear',
  'StyleCraft',
  'ElegantFit',
  'FashionForward',
  'LuxeWear',
  'ComfortStride',
  'UrbanStyle',
];

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string[]>(
    initialData?.images || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      isNew: false,
      isFeatured: false,
      isBestSeller: false,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setImagePreview((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const discountPrice = watch('discountPrice');
  const price = watch('price');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Product Name */}
        <FormField>
          <FormLabel>Product Name *</FormLabel>
          <Input
            {...register('name')}
            placeholder='Enter product name'
            className='fashion-input'
          />
          {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
        </FormField>

        {/* Category */}
        <FormField>
          <FormLabel>Category *</FormLabel>
          <select
            {...register('category')}
            className='fashion-input rounded'
          >
            <option value=''>Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <FormMessage>{errors.category.message}</FormMessage>}
        </FormField>

        {/* Brand */}
        <FormField>
          <FormLabel>Brand *</FormLabel>
          <select
            {...register('brand')}
            className='fashion-input rounded'
          >
            <option value=''>Select brand</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          {errors.brand && <FormMessage>{errors.brand.message}</FormMessage>}
        </FormField>

        {/* Price */}
        <FormField>
          <FormLabel>Price (PKR) *</FormLabel>
          <Input
            {...register('price', { valueAsNumber: true })}
            type='number'
            step='0.01'
            placeholder='Enter price'
            className='fashion-input'
          />
          {errors.price && <FormMessage>{errors.price.message}</FormMessage>}
        </FormField>

        {/* Discount Price */}
        <FormField>
          <FormLabel>Discount Price (PKR)</FormLabel>
          <Input
            {...register('discountPrice', { valueAsNumber: true })}
            type='number'
            step='0.01'
            placeholder='Leave empty if no discount'
            className='fashion-input'
          />
          {errors.discountPrice && (
            <FormMessage>{errors.discountPrice.message}</FormMessage>
          )}
          {discountPrice && price && discountPrice >= price && (
            <FormMessage>Discount price must be less than regular price</FormMessage>
          )}
        </FormField>

        {/* Stock */}
        <FormField>
          <FormLabel>Stock Quantity *</FormLabel>
          <Input
            {...register('stock', { valueAsNumber: true })}
            type='number'
            min='0'
            placeholder='Enter stock quantity'
            className='fashion-input'
          />
          {errors.stock && <FormMessage>{errors.stock.message}</FormMessage>}
        </FormField>

        {/* Warranty */}
        <FormField>
          <FormLabel>Warranty</FormLabel>
          <Input
            {...register('warranty')}
            placeholder='e.g., 2 Years Manufacturer'
            className='fashion-input'
          />
          {errors.warranty && <FormMessage>{errors.warranty.message}</FormMessage>}
        </FormField>
      </div>

      {/* Description */}
      <FormField>
        <FormLabel>Description *</FormLabel>
        <textarea
          {...register('description')}
          placeholder='Enter product description'
          rows={4}
          className='fashion-input rounded w-full px-3 py-2'
        />
        {errors.description && (
          <FormMessage>{errors.description.message}</FormMessage>
        )}
      </FormField>

      {/* Image Upload */}
      <FormField>
        <FormLabel>Product Images</FormLabel>
        <div className='border-2 border-dashed border-emerald-900/50 rounded-lg p-6 hover:border-emerald-500/50 transition-colors cursor-pointer'>
          <input
            type='file'
            multiple
            accept='image/*'
            onChange={handleImageUpload}
            className='hidden'
            id='image-upload'
          />
          <label
            htmlFor='image-upload'
            className='block text-center cursor-pointer'
          >
            <p className='text-sm text-muted-foreground'>
              Click to upload or drag and drop images
            </p>
          </label>
        </div>

        {/* Image Preview */}
        {imagePreview.length > 0 && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
            {imagePreview.map((preview, index) => (
              <div key={index} className='relative group h-24'>
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className='object-cover rounded border border-emerald-900/50'
                />
                <button
                  type='button'
                  onClick={() => removeImage(index)}
                  className='absolute top-1 right-1 bg-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10'
                >
                  <X className='h-3 w-3 text-white' />
                </button>
              </div>
            ))}
          </div>
        )}
      </FormField>

      {/* Checkboxes */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <label className='flex items-center space-x-2 cursor-pointer'>
          <input
            type='checkbox'
            {...register('isNew')}
            className='w-4 h-4'
          />
          <span className='text-sm text-emerald-400'>Mark as New</span>
        </label>

        <label className='flex items-center space-x-2 cursor-pointer'>
          <input
            type='checkbox'
            {...register('isFeatured')}
            className='w-4 h-4'
          />
          <span className='text-sm text-emerald-400'>Mark as Featured</span>
        </label>

        <label className='flex items-center space-x-2 cursor-pointer'>
          <input
            type='checkbox'
            {...register('isBestSeller')}
            className='w-4 h-4'
          />
          <span className='text-sm text-emerald-400'>Mark as Best Seller</span>
        </label>
      </div>

      {/* Buttons */}
      <div className='flex gap-2 justify-end'>
        <Button
          type='submit'
          disabled={isLoading}
          className='gaming-btn-primary'
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
