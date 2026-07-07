const Order = require('../models/Order')
const IngredientOption = require('../models/IngredientOption')

// Dashboard summary stats
const getDashboardStats = async () => {
    const [
        totalOrders,
        pendingOrders,
        inKitchenOrders,
        totalRevenue,
        lowStockCount,
    ] = await Promise.all([
        Order.countDocuments({ paymentStatus: 'paid' }),
        Order.countDocuments({ status: 'placed' }),
        Order.countDocuments({ status: 'in_kitchen' }),
        Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        IngredientOption.countDocuments({
            $expr: { $lte: ['$quantity', '$thresholdValue'] },
            isActive: true,
        }),
    ])

    return {
        totalOrders,
        pendingOrders,
        inKitchenOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        lowStockCount,
    }
}

// Restock an ingredient — admin manually updates quantity
const restockIngredient = async (id, quantity) => {
    if (quantity <= 0) {
        const error = new Error('Quantity must be greater than 0')
        error.statusCode = 400
        throw error
    }

    const ingredient = await IngredientOption.findByIdAndUpdate(
        id,
        { $inc: { quantity } },  // increment, not replace
        { new: true }
    )

    if (!ingredient) {
        const error = new Error('Ingredient not found')
        error.statusCode = 404
        throw error
    }

    return ingredient
}

module.exports = { getDashboardStats, restockIngredient }