import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const updateCounts = searchParams.get('updateCounts') === 'true';

    // Update product counts if requested
    if (updateCounts) {
      const categories = await Category.find({});
      for (const category of categories) {
        const productCount = await Product.countDocuments({ category: category._id, status: 'active' });
        await Category.findByIdAndUpdate(category._id, { productCount });
      }
    }

    const query: any = {};
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const categories = await Category.find(query).sort({ displayOrder: 1 });

    // Transform categories to match frontend type expectations
    const transformedCategories = categories.map(category => ({
      ...category.toObject(),
      id: category._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      categories: transformedCategories,
      total: transformedCategories.length,
    });
  } catch (error) {
    console.error('[CATEGORIES] Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, slug, image, description, status, displayOrder, metaTitle, metaDescription, parentCategory } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const categorySlug = slug || generateSlug(name);
    const existingCategory = await Category.findOne({ slug: categorySlug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Get max display order if not provided
    let maxOrder = 0;
    if (displayOrder === undefined) {
      const lastCategory = await Category.findOne().sort({ displayOrder: -1 });
      maxOrder = lastCategory ? lastCategory.displayOrder + 1 : 1;
    }

    const category = await Category.create({
      name,
      slug: categorySlug,
      image: image || '',
      description: description || '',
      productCount: 0,
      status: status || 'active',
      displayOrder: displayOrder !== undefined ? displayOrder : maxOrder,
      metaTitle,
      metaDescription,
      parentCategory,
    });

    // Transform category to match frontend type expectations
    const transformedCategory = {
      ...category.toObject(),
      id: category._id.toString(),
    };

    return NextResponse.json({
      success: true,
      category: transformedCategory,
      message: 'Category created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[CATEGORIES] Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, name, slug, image, description, status, displayOrder, metaTitle, metaDescription, parentCategory } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if new slug conflicts with existing category
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    else if (name) updateData.slug = generateSlug(name);
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (parentCategory !== undefined) updateData.parentCategory = parentCategory;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Transform category to match frontend type expectations
    const transformedCategory = {
      ...updatedCategory.toObject(),
      id: updatedCategory._id.toString(),
    };

    return NextResponse.json({
      success: true,
      category: transformedCategory,
      message: 'Category updated successfully',
    });
  } catch (error: any) {
    console.error('[CATEGORIES] Error updating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('[CATEGORIES] Error deleting category:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      },
      { status: 500 }
    );
  }
}
