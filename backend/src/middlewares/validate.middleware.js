const { validationResult } = require('express-validator')
const { sendError } = require('../utils/apiResponse')

const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const message = errors.array()[0].msg  // return first error only
        return sendError(res, 422, message)
    }
    next()
}

module.exports = validate