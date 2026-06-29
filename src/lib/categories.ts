import path from 'path';
import { readFile, writeFile } from 'fs/promises';

const DATA_DIR = path.join(process.cwd(), 'data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
  status: 'active' | 'inactive';
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Default categories to initialize if file doesn't exist
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Fashion Accessories',
    slug: 'fashion-accessories',
    image: '/images/categories/fashion.jpg',
    description: 'Premium fashion gear for serious gamers',
    productCount: 45,
    status: 'active',
    displayOrder: 1,
    metaTitle: 'Fashion Accessories - Premium Fashion Gear',
    metaDescription: 'Shop the best fashion accessories including mice, keyboards, headsets, and more.',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2',
    name: 'Mobile Accessories',
    slug: 'mobile-accessories',
    image: '/images/categories/mobile.jpg',
    description: 'Essential accessories for your smartphone',
    productCount: 32,
    status: 'active',
    displayOrder: 2,
    metaTitle: 'Mobile Accessories - Phone Cases, Chargers & More',
    metaDescription: 'Discover essential mobile accessories including cases, chargers, cables, and more.',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '3',
    name: 'RGB Products',
    slug: 'rgb-products',
    image: '/images/categories/rgb.jpg',
    description: 'Light up your setup with RGB products',
    productCount: 28,
    status: 'active',
    displayOrder: 3,
    metaTitle: 'RGB Products - RGB Lighting & Fashion Gear',
    metaDescription: 'Illuminate your setup with our collection of RGB products and lighting solutions.',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '4',
    name: 'PC Accessories',
    slug: 'pc-accessories',
    image: '/images/categories/pc.jpg',
    description: 'Enhance your PC experience',
    productCount: 56,
    status: 'active',
    displayOrder: 4,
    metaTitle: 'PC Accessories - Computer Parts & Peripherals',
    metaDescription: 'Upgrade your PC with our selection of accessories, components, and peripherals.',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// Ensure data directory exists
async function ensureDataDir() {
  const { promises: fs } = await import('fs');
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Get all categories (server-side only)
export async function getCategories(): Promise<Category[]> {
  try {
    const { promises: fs } = await import('fs');
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, initialize with default categories
    await initializeDefaultCategories();
    return DEFAULT_CATEGORIES;
  }
}

// Save categories (server-side only)
async function saveCategories(categories: Category[]): Promise<void> {
  await ensureDataDir();
  const { promises: fs } = await import('fs');
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

// Initialize default categories
async function initializeDefaultCategories(): Promise<void> {
  await ensureDataDir();
  const { promises: fs } = await import('fs');
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2));
  console.log('[CATEGORIES] Initialized with default categories');
}

// Create category (server-side only)
export async function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; category?: Category; error?: string }> {
  try {
    const categories = await getCategories();
    
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    categories.push(newCategory);
    await saveCategories(categories);
    
    console.log('[CATEGORIES] Category created:', newCategory.id, newCategory.name);
    
    return { success: true, category: newCategory };
  } catch (error: any) {
    console.error('[CATEGORIES] Error creating category:', error);
    return { success: false, error: error.message };
  }
}

// Update category (server-side only)
export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<{ success: boolean; category?: Category; error?: string }> {
  try {
    const categories = await getCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Category not found' };
    }
    
    const updatedCategory: Category = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    categories[index] = updatedCategory;
    await saveCategories(categories);
    
    console.log('[CATEGORIES] Category updated:', id);
    
    return { success: true, category: updatedCategory };
  } catch (error: any) {
    console.error('[CATEGORIES] Error updating category:', error);
    return { success: false, error: error.message };
  }
}

// Delete category (server-side only)
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const categories = await getCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Category not found' };
    }
    
    if (categories[index].productCount > 0) {
      return { success: false, error: 'Cannot delete category that contains products' };
    }
    
    categories.splice(index, 1);
    await saveCategories(categories);
    
    console.log('[CATEGORIES] Category deleted:', id);
    
    return { success: true };
  } catch (error: any) {
    console.error('[CATEGORIES] Error deleting category:', error);
    return { success: false, error: error.message };
  }
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(c => c.slug === slug) || null;
}

// Get category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(c => c.id === id) || null;
}

// Update category product counts based on actual products
export async function updateCategoryProductCounts(): Promise<void> {
  try {
    const { promises: fs } = await import('fs');
    
    // Read all categories and products
    const categories = await getCategories();
    const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8').catch(() => '[]');
    const products = JSON.parse(productsData);
    
    // Count active products for each category
    const categoryCounts: Record<string, number> = {};
    
    products.forEach((product: any) => {
      if (product.status === 'active' || !product.status) {
        const categorySlug = product.category;
        if (categorySlug) {
          categoryCounts[categorySlug] = (categoryCounts[categorySlug] || 0) + 1;
        }
      }
    });
    
    // Update categories with actual counts
    const updatedCategories = categories.map(category => ({
      ...category,
      productCount: categoryCounts[category.slug] || 0,
      updatedAt: new Date().toISOString()
    }));
    
    // Save updated categories
    await saveCategories(updatedCategories);
    
    console.log('[CATEGORIES] Product counts updated successfully');
  } catch (error: any) {
    console.error('[CATEGORIES] Error updating product counts:', error);
  }
}
