
const careService = require('../services/careService');

const careController = {
    // GET /api/care/services
    async getAll(req, res, next) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            const data = await careService.getCareServices(isAdmin);

            res.status(200).json({
                success: true,
                message: 'L???y danh s??ch d???ch v??? th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/care/services/:id
    async getById(req, res, next) {
        try {
            const data = await careService.getCareServiceById(req.params.id);

            if (
                req.user?.role !== 'ADMIN' &&
                data.service_status !== 'ACTIVE'
            ) {
                return res.status(404).json({
                    success: false,
                    message: 'Kh??ng t??m th???y d???ch v???.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'L???y th??ng tin d???ch v??? th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/care/categories/:categoryId/services
    async getByCategory(req, res, next) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';

            const data = await careService.getServicesByCategory(
                req.params.categoryId,
                isAdmin
            );

            res.status(200).json({
                success: true,
                message: 'L???y danh s??ch d???ch v??? theo danh m???c th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/care/services
    async create(req, res, next) {
        try {
            const data = await careService.createCareService(req.body);

            res.status(201).json({
                success: true,
                message: 'Th??m d???ch v??? th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/care/services/:id
    async update(req, res, next) {
        try {
            const data = await careService.updateCareService(
                req.params.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: 'C???p nh???t d???ch v??? th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/care/services/:id/status
    async updateStatus(req, res, next) {
        try {
            const data = await careService.updateCareServiceStatus(
                req.params.id,
                req.body.service_status
            );

            res.status(200).json({
                success: true,
                message: 'C???p nh???t tr???ng th??i d???ch v??? th??nh c??ng.',
                data
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/care/services/:id
    async delete(req, res, next) {
        try {
            await careService.deleteCareService(req.params.id);

            res.status(200).json({
                success: true,
                message: 'X??a d???ch v??? th??nh c??ng.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = careController;
