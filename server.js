const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Import database connection and service
const connectDB = require('./config/database');
const itemService = require('./services/itemService');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to add image URLs
const addImageUrls = (item) => ({
  ...item.toObject(),
  coverImageUrl: item.coverImage ? `https://internshala-backend-j6l3.onrender.com/uploads/${item.coverImage}` : null,
  additionalImageUrls: item.additionalImages.map(img => `https://internshala-backend-j6l3.onrender.com/uploads/${img}`)
});



// POST route to add new item
app.post('/api/items', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const { itemName, itemType, itemDescription } = req.body;
    
    // Validate required fields
    if (!itemName || !itemType || !itemDescription) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const coverImagePath = req.files['coverImage'] ? req.files['coverImage'][0].filename : null;
    const additionalImagePaths = req.files['additionalImages'] ? 
      req.files['additionalImages'].map(file => file.filename) : [];

    const itemData = {
      itemName,
      itemType,
      itemDescription,
      coverImage: coverImagePath,
      additionalImages: additionalImagePaths
    };

    const newItem = await itemService.createItem(itemData);

    res.status(201).json({
      message: 'Item successfully added',
      item: addImageUrls(newItem)
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET route to fetch all items
app.get('/api/items', async (req, res) => {
  try {
    const { search } = req.query;
    
    let items;
    if (search) {
      items = await itemService.searchItems(search);
    } else {
      items = await itemService.getAllItems();
    }

    const itemsWithImageUrls = items.map(item => addImageUrls(item));

    res.json({
      success: true,
      count: items.length,
      items: itemsWithImageUrls
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: error.message });
  }
});


// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on https://internshala-backend-j6l3.onrender.com`);
});