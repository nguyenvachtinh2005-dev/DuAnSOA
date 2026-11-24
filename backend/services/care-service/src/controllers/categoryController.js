
const careService = require('../services/careService');

const categoryController = {
    // GET /api/care/categories
    async getAll(req, res, next) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            const data = await careService.getCategories(isAdmin);

            res.status(200).json({
                success: true,
                message: 'L???y danh s??ch danh m???c th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/care/categories/:id
    async getById(req, res, next) {
        try {
            const data = await careService.getCategoryById(req.params.id);

            if (!data.is_active && req.user?.role !== 'ADMIN') {
                return res.status(404).json({
                    success: false,
                    message: 'Kh??ng t??m th???y danh m???c.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'L???y th??ng tin danh m???c th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/care/categories
    async create(req, res, next) {
        try {
            const data = await careService.createCategory(req.body);

            res.status(201).json({
                success: true,
                message: 'Th??m danh m???c th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/care/categories/:id
    async update(req, res, next) {
        try {
            const data = await careService.updateCategory(
                req.params.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: 'C???p nh???t danh m???c th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/care/categories/:id/status
    async updateStatus(req, res, next) {
        try {
            const data = await careService.updateCategoryStatus(
                req.params.id,
                req.body.is_active
            );

            res.status(200).json({
                success: true,
                message: 'C???p nh???t tr???ng th??i danh m???c th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/care/categories/:id
    async delete(req, res, next) {
        try {
            await careService.deleteCategory(req.params.id);

            res.status(200).json({
                success: true,
                message: 'X??a danh m???c th??nh c??ng.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = categoryController;
