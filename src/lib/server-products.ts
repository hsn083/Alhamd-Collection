import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_FILE = join(process.cwd(), 'data', 'products.json');

// Helper function to read products from JSON file
export async function readProducts(): Promise<any[]> {
  try {
    if (!existsSync(DATA_FILE)) {
      return [];
    }
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

// Helper function to write products to JSON file
export async function writeProducts(products: any[]): Promise<void> {
  try {
    await writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing products:', error);
    throw error;
  }
}
