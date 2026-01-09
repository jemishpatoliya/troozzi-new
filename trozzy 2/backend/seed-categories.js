const mongoose = require('mongoose');
require('dotenv').config();
const { CategoryModel } = require('./src/models/category');

const categories = [
    {
        name: 'Fashion',
        shortDescription: 'Latest fashion trends',
        description: 'Clothes, shoes and accessories for men and women',
        order: 1,
        active: true,
        imageUrl: 'https://serviceapi.spicezgold.com/download/1755610847575_file_1734525204708_fash.png'
    },
    {
        name: 'Electronics',
        shortDescription: 'Gadgets and appliances',
        description: 'Smartphones, laptops, and home appliances',
        order: 2,
        active: true,
        imageUrl: 'https://serviceapi.spicezgold.com/download/1741600988059_ele.png'
    },
    {
        name: 'Home & Garden',
        shortDescription: 'Home decor and gardening',
        description: 'Furniture, lights, and garden tools',
        order: 3,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1485955900006-10cb4e966f3e?w=400'
    },
    {
        name: 'Books & Media',
        shortDescription: 'Books, movies and music',
        description: 'Best selling novels and music albums',
        order: 4,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
    }
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await CategoryModel.deleteMany({});
        console.log('Deleted existing categories');

        await CategoryModel.insertMany(categories);
        console.log('Seeded categories successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
