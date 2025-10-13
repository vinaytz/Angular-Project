const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Mock data for services and categories
const mockCategories = [
  {
    id: '1',
    name: 'Programming & Tech',
    icon: '💻',
    description: 'Custom software solutions',
    serviceCount: 1234,
    subcategories: ['Web Development', 'Mobile Apps', 'Desktop Applications']
  },
  {
    id: '2',
    name: 'Graphics & Design',
    icon: '🎨',
    description: 'Visual creativity unleashed',
    serviceCount: 987,
    subcategories: ['Logo Design', 'Web Design', 'Print Design']
  },
  {
    id: '3',
    name: 'Writing & Translation',
    icon: '✍️',
    description: 'Words that make impact',
    serviceCount: 756,
    subcategories: ['Content Writing', 'Copywriting', 'Translation']
  }
];

const mockServices = [
  {
    id: '1',
    title: 'I will create a modern responsive website with React',
    description: 'Professional React development with modern design',
    freelancerId: 'freelancer1',
    category: 'Programming & Tech',
    subcategory: 'Web Development',
    price: 299,
    deliveryTime: 7,
    rating: 5.0,
    reviewCount: 127,
    images: ['https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'],
    tags: ['React', 'JavaScript', 'Responsive'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    freelancer: {
      id: 'freelancer1',
      firstName: 'Sarah',
      lastName: 'Chen',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      rating: 5.0,
      totalProjects: 127
    }
  }
];

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 12 } = req.query;
    
    let filteredServices = [...mockServices];
    
    if (category) {
      filteredServices = filteredServices.filter(s => s.category === category);
    }
    
    if (search) {
      filteredServices = filteredServices.filter(s => 
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (featured === 'true') {
      filteredServices = filteredServices.filter(s => s.isFeatured);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedServices = filteredServices.slice(startIndex, endIndex);
    
    res.json(paginatedServices);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured services
router.get('/featured', async (req, res) => {
  try {
    const featuredServices = mockServices.filter(s => s.isFeatured);
    res.json(featuredServices);
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = mockServices.find(s => s.id === req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
router.get('/', async (req, res) => {
  try {
    res.json(mockCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search services
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const searchResults = mockServices.filter(s =>
      s.title.toLowerCase().includes(q.toLowerCase()) ||
      s.description.toLowerCase().includes(q.toLowerCase()) ||
      s.tags.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
    );
    
    res.json(searchResults);
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;