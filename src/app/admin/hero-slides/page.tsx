'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Image as ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageDesktop: string;
  imageMobile: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageDesktop: '',
    imageMobile: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
  });

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides');
      const data = await response.json();
      if (data.success) {
        setSlides(data.slides);
      }
    } catch (error) {
      console.error('Error loading slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      imageDesktop: '',
      imageMobile: '',
      buttonText: '',
      buttonLink: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description || '',
      imageDesktop: slide.imageDesktop,
      imageMobile: slide.imageMobile,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      isActive: slide.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        loadSlides();
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const response = await fetch(`/api/hero-slides/${slide._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      const data = await response.json();
      if (data.success) {
        loadSlides();
      }
    } catch (error) {
      console.error('Error toggling slide:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSlide 
        ? `/api/hero-slides/${editingSlide._id}`
        : '/api/hero-slides';
      
      const method = editingSlide ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        loadSlides();
      }
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const handleImageUpload = async (field: 'imageDesktop' | 'imageMobile') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          setFormData(prev => ({ ...prev, [field]: data.url }));
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading slides...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hero Slides</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Slide
        </button>
      </div>

      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No slides yet. Click "Add Slide" to create one.
          </div>
        ) : (
          slides.map((slide) => (
            <div
              key={slide._id}
              className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
              
              <div className="relative w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {slide.imageDesktop ? (
                  <Image
                    src={slide.imageDesktop}
                    alt={slide.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{slide.title}</h3>
                <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(slide)}
                  className={`px-3 py-1 rounded text-sm ${
                    slide.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {slide.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(slide._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingSlide ? 'Edit Slide' : 'Create Slide'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtitle *</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Desktop Image *</label>
                  <div className="space-y-2">
                    {formData.imageDesktop && (
                      <div className="relative w-full h-32 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={formData.imageDesktop}
                          alt="Desktop preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleImageUpload('imageDesktop')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Desktop Image
                    </button>
                    {formData.imageDesktop && (
                      <input
                        type="text"
                        value={formData.imageDesktop}
                        onChange={(e) => setFormData({ ...formData, imageDesktop: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Or paste URL"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mobile Image *</label>
                  <div className="space-y-2">
                    {formData.imageMobile && (
                      <div className="relative w-full h-32 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={formData.imageMobile}
                          alt="Mobile preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleImageUpload('imageMobile')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Mobile Image
                    </button>
                    {formData.imageMobile && (
                      <input
                        type="text"
                        value={formData.imageMobile}
                        onChange={(e) => setFormData({ ...formData, imageMobile: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Or paste URL"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Button Text *</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Button Link *</label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="/products or https://example.com"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingSlide ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
