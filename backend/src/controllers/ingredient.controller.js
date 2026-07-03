const ingredientService = require('../services/ingredient.service')
const { sendSuccess, sendError } = require('../utils/apiResponse')

const getAllIngredients = async (req, res, next) => {
    try {
        const data = await ingredientService.getAllIngredients()
        sendSuccess(res, 200, 'Ingredients fetched', data)
    } catch (err) {
        next(err)
    }
}

const getIngredientsByType = async (req, res, next) => {
    try {
        const data = await ingredientService.getIngredientsByType(req.params.type)
        sendSuccess(res, 200, 'Ingredients fetched', data)
    } catch (err) {
        next(err)
    }
}

const getAllForAdmin = async (req, res, next) => {
    try {
        const data = await ingredientService.getAllForAdmin()
        sendSuccess(res, 200, 'All ingredients fetched', data)
    } catch (err) {
        next(err)
    }
}

const addIngredient = async (req, res, next) => {
    try {
        const data = await ingredientService.addIngredient(req.body)
        sendSuccess(res, 201, 'Ingredient added', data)
    } catch (err) {
        next(err)
    }
}

const updateIngredient = async (req, res, next) => {
    try {
        const data = await ingredientService.updateIngredient(req.params.id, req.body)
        sendSuccess(res, 200, 'Ingredient updated', data)
    } catch (err) {
        next(err)
    }
}

const deleteIngredient = async (req, res, next) => {
    try {
        const data = await ingredientService.deleteIngredient(req.params.id)
        sendSuccess(res, 200, data.message)
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getAllIngredients,
    getIngredientsByType,
    getAllForAdmin,
    addIngredient,
    updateIngredient,
    deleteIngredient,
}