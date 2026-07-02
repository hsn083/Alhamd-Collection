# MongoDB Setup Guide for AlhamdCollection

## Root Cause Analysis

The Homepage Hero Banner Slider was failing because:
1. MongoDB is not running on your system
2. No `.env` file exists with database connection string
3. The application uses MongoDB (not the JSON files in `data/` folder)
4. Without database connection, the API cannot retrieve banner data
5. HeroSlider receives empty array → renders blank slides

## Solution Options

### Option 1: Use MongoDB Atlas (Recommended - Easiest)

MongoDB Atlas is a cloud-hosted MongoDB service. It's free for small projects and requires no local installation.

**Steps:**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (select the free M0 tier)
4. Create a database user with username and password
5. Whitelist your IP address (or select "Allow access from anywhere" for development)
6. Click "Connect" → "Connect your application"
7. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
8. Create a `.env` file in the project root with the connection string

**Example .env file:**
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/alhamd-collection

# Cloudinary Configuration (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Option 2: Install MongoDB Locally

**For Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and complete the installation
3. MongoDB will be installed as a service and start automatically
4. The default connection string is: `mongodb://localhost:27017/alhamd-collection`

**To start MongoDB service manually:**
```powershell
# Check if MongoDB service exists
Get-Service | Where-Object {$_.Name -like "*mongo*"}

# Start MongoDB service
Start-Service MongoDB

# Or start MongoDB directly
mongod --dbpath "C:\data\db"
```

**Create .env file:**
```env
MONGODB_URI=mongodb://localhost:27017/alhamd-collection

# Cloudinary Configuration (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Option 3: Use MongoDB Docker Container

If you have Docker installed:

```powershell
# Pull and run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Connection string for .env:
MONGODB_URI=mongodb://localhost:27017/alhamd-collection
```

## Cloudinary Setup (Required for Image Uploads)

The Hero Banner system uses Cloudinary for image storage. You must configure this:

1. Go to https://cloudinary.com/users/register/free
2. Create a free account
3. Go to Dashboard → Settings → API Security
4. Copy your:
   - Cloud name
   - API Key
   - API Secret
5. Add these to your `.env` file

## Verification Steps

After setting up MongoDB and creating the `.env` file:

1. **Restart the development server:**
   ```powershell
   npm run dev
   ```

2. **Check the console logs:**
   - Look for "MongoDB connected successfully"
   - Look for "[HeroSlider] Fetching banner data..."
   - Look for "[HeroSlider] Loaded X valid banners"

3. **Test the Admin Panel:**
   - Go to http://localhost:3000/admin/hero-banners
   - Create a new banner with desktop and mobile images
   - Verify the banner appears in the list

4. **Test the Homepage:**
   - Go to http://localhost:3000
   - Verify the banner slider displays correctly
   - Check that images, text, and buttons are visible

## Troubleshooting

### MongoDB Connection Errors

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:** MongoDB is not running. Start MongoDB service or use MongoDB Atlas.

**Error:** `Authentication failed`

**Solution:** Check your username and password in the connection string. For Atlas, ensure you created a database user.

### Banner Not Displaying

**Check browser console for:**
- `[HeroSlider] Fetching banner data...`
- `[HeroSlider] Loaded X valid banners`
- Any error messages

**If you see "No valid banners found":**
- Go to Admin Panel → Hero Banners
- Create at least one active banner
- Ensure both desktop and mobile images are uploaded

**If images don't load:**
- Check Cloudinary configuration in `.env`
- Verify image URLs are valid
- Check browser network tab for failed requests

## What I Fixed in the Code

I added robust error handling to `src/components/HeroSlider.tsx`:

1. **Database connection error detection** - Catches and logs MongoDB connection failures
2. **Fallback placeholder banner** - Shows a default banner when database fails or no banners exist
3. **Default settings** - Uses sensible defaults when settings API fails
4. **Enhanced logging** - Detailed console logs for debugging
5. **API error handling** - Properly handles HTTP errors from the API
6. **Image validation** - Validates image URLs before rendering

This ensures the slider never shows a blank white screen, even when the database is down.

## Next Steps

1. Choose a MongoDB setup option (Atlas recommended)
2. Create your `.env` file with the connection string
3. Configure Cloudinary for image uploads
4. Restart the development server
5. Create your first banner via the Admin Panel
6. Verify the banner displays on the homepage

## Support

If you encounter issues:
- Check the browser console for error messages
- Check the terminal where `npm run dev` is running
- Review the MongoDB logs
- Verify your `.env` file has no typos
