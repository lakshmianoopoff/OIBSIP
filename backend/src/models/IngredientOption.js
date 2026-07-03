const mongoose = require('mongoose')

const ingredientOptionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
            required: [true, 'Ingredient type is required'],
        },
        name: {
            type: String,
            required: [true, 'Ingredient name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 100,
        },
        thresholdValue: {
            type: Number,
            default: 20,  // alert when stock drops below this
        },
        unit: {
            type: String,
            default: 'units',
        },
        isActive: {
            type: Boolean,
            default: true,  // admin can soft-disable without deleting
        },
    },
    { timestamps: true }
)

// Virtual field — computed on the fly, not stored in DB
// isAvailable is true only when active AND stock > 0
ingredientOptionSchema.virtual('isAvailable').get(function () {
    return this.isActive && this.quantity > 0
})

// Make virtuals appear in JSON responses
ingredientOptionSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('IngredientOption', ingredientOptionSchema)