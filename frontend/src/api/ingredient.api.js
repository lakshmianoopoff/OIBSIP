import api from './axios'

export const getAllIngredients = () => api.get('/ingredients')
export const getIngredientsByType = (type) => api.get(`/ingredients/${type}`)
export const addIngredient = (data) => api.post('/ingredients', data)
export const updateIngredient = (id, data) => api.put(`/ingredients/${id}`, data)
export const deleteIngredient = (id) => api.delete(`/ingredients/${id}`)