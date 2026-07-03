const IngredientOption = require('../models/IngredientOption')

// Get all ingredients grouped by type — for the pizza builder
const getAllIngredients = async () => {
    const ingredients = await IngredientOption.find({ isActive: true })

    // Group by type so frontend gets { base: [...], sauce: [...], ... }
    const grouped = ingredients.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = []
        acc[item.type].push(item)
        return acc
    }, {})

    return grouped
}

// Get by specific type — e.g. only bases
const getIngredientsByType = async (type) => {
    return await IngredientOption.find({ type, isActive: true })
}

// Admin — get ALL including inactive, with stock info
const getAllForAdmin = async () => {
    return await IngredientOption.find().sort({ type: 1, name: 1 })
}

// Admin — add new ingredient
const addIngredient = async (data) => {
    const existing = await IngredientOption.findOne({
        name: data.name,
        type: data.type,
    })

    if (existing) {
        const error = new Error('Ingredient with this name already exists')
        error.statusCode = 409
        throw error
    }

    return await IngredientOption.create(data)
}

// Admin — update ingredient (stock, price, availability)
const updateIngredient = async (id, updates) => {
    const ingredient = await IngredientOption.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    )

    if (!ingredient) {
        const error = new Error('Ingredient not found')
        error.statusCode = 404
        throw error
    }

    return ingredient
}

// Admin — delete ingredient
const deleteIngredient = async (id) => {
    const ingredient = await IngredientOption.findByIdAndDelete(id)

    if (!ingredient) {
        const error = new Error('Ingredient not found')
        error.statusCode = 404
        throw error
    }

    return { message: 'Ingredient deleted successfully' }
}

// Decrease stock after order is placed
// Called from order service — not exposed as an API directly
const decreaseStock = async (items) => {
    for (const item of items) {
        const ingredientNames = [
            item.base,
            item.sauce,
            item.cheese,
            ...item.veggies,
            ...(item.meat || []),
        ]

        for (const name of ingredientNames) {
            await IngredientOption.findOneAndUpdate(
                { name, quantity: { $gt: 0 } },
                { $inc: { quantity: -1 } }
            )
        }
    }
}

// Check if any ingredient is below threshold — used by cron job
const getLowStockIngredients = async () => {
    return await IngredientOption.find({
        $expr: { $lte: ['$quantity', '$thresholdValue'] },
        isActive: true,
    })
}

module.exports = {
    getAllIngredients,
    getIngredientsByType,
    getAllForAdmin,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    decreaseStock,
    getLowStockIngredients,
}