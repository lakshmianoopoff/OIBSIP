require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const IngredientOption = require('../models/IngredientOption')

const seedData = {
    bases: [
        { name: 'Thin Crust', price: 50, quantity: 100, type: 'base' },
        { name: 'Thick Crust', price: 60, quantity: 100, type: 'base' },
        { name: 'Cheese Burst', price: 80, quantity: 100, type: 'base' },
        { name: 'Whole Wheat', price: 70, quantity: 100, type: 'base' },
        { name: 'Gluten Free', price: 90, quantity: 100, type: 'base' },
    ],
    sauces: [
        { name: 'Marinara', price: 20, quantity: 100, type: 'sauce' },
        { name: 'Pesto', price: 30, quantity: 100, type: 'sauce' },
        { name: 'BBQ', price: 25, quantity: 100, type: 'sauce' },
        { name: 'White Garlic', price: 25, quantity: 100, type: 'sauce' },
        { name: 'Spicy Arrabbiata', price: 20, quantity: 100, type: 'sauce' },
    ],
    cheeses: [
        { name: 'Mozzarella', price: 40, quantity: 100, type: 'cheese' },
        { name: 'Cheddar', price: 45, quantity: 100, type: 'cheese' },
        { name: 'Parmesan', price: 50, quantity: 100, type: 'cheese' },
        { name: 'Vegan Cheese', price: 60, quantity: 100, type: 'cheese' },
        { name: 'Double Mozzarella', price: 70, quantity: 100, type: 'cheese' },
    ],
    veggies: [
        { name: 'Bell Peppers', price: 15, quantity: 100, type: 'veggie' },
        { name: 'Mushrooms', price: 20, quantity: 100, type: 'veggie' },
        { name: 'Onions', price: 10, quantity: 100, type: 'veggie' },
        { name: 'Olives', price: 20, quantity: 100, type: 'veggie' },
        { name: 'Corn', price: 15, quantity: 100, type: 'veggie' },
        { name: 'Jalapenos', price: 15, quantity: 100, type: 'veggie' },
        { name: 'Tomatoes', price: 10, quantity: 100, type: 'veggie' },
        { name: 'Spinach', price: 15, quantity: 100, type: 'veggie' },
    ],
    meats: [
        { name: 'Chicken', price: 60, quantity: 100, type: 'meat' },
        { name: 'Pepperoni', price: 70, quantity: 100, type: 'meat' },
        { name: 'Bacon', price: 65, quantity: 100, type: 'meat' },
    ],
}

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MongoDB')

        // Clear existing data
        await IngredientOption.deleteMany({})
        await User.deleteMany({ role: 'admin' })
        console.log('Cleared existing seed data')

        // Seed ingredients
        const allIngredients = [
            ...seedData.bases,
            ...seedData.sauces,
            ...seedData.cheeses,
            ...seedData.veggies,
            ...seedData.meats,
        ].map(item => ({ ...item, thresholdValue: 20, unit: 'units', isActive: true }))

        await IngredientOption.insertMany(allIngredients)
        console.log(`Seeded ${allIngredients.length} ingredients`)

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 12)
        await User.create({
            name: 'Pizza Admin',
            email: 'admin@pizzaapp.com',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,   // admin doesn't need email verification
        })
        console.log('Admin user created')
        console.log('Email: admin@pizzaapp.com')
        console.log('Password: admin123')

        console.log('\n✅ Seed complete!')
        process.exit(0)
    } catch (err) {
        console.error('Seed error:', err)
        process.exit(1)
    }
}

seed()