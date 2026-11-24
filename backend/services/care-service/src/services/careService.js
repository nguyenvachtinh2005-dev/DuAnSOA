
const Category = require('../models/category.model');
const CareService = require('../models/careService.model');

const {
    validateId,
    validateCategory,
    validateCareService,
    validateCategoryStatus,
    validateServiceStatus
} = require('../validators/careValidator');

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const careService = {
    // =========================
    // CATEGORY
    // =========================

    async getCategories(isAdmin = false) {
        return Category.findAll(!isAdmin);
    },

    async getCategoryById(id) {
        if (!validateId(id)) {
            throw createError('ID danh m???c kh??ng h???p l???.');
        }

        const category = await Category.findById(id);

        if (!category) {
            throw createError('Kh??ng t??m th???y danh m???c.', 404);
        }

        return category;
    },

    async createCategory(data) {
        const errors = validateCategory(data);

        if (errors.length) {
            throw createError(errors.join(' '));
        }

        return Category.create({
            name: data.name.trim(),
            description: data.description?.trim() || null
        });
    },

    async updateCategory(id, data) {
        if (!validateId(id)) {
            throw createError('ID danh m???c kh??ng h???p l???.');
        }

        const errors = validateCategory(data);

        if (errors.length) {
            throw createError(errors.join(' '));
        }

        const category = await Category.findById(id);

        if (!category) {
            throw createError('Kh??ng t??m th???y danh m???c.', 404);
        }

        return Category.update(id, {
            name: data.name.trim(),
            description: data.description?.trim() || null
        });
    },

    async updateCategoryStatus(id, isActive) {
        if (!validateId(id)) {
            throw createError('ID danh m???c kh??ng h???p l???.');
        }

        if (!validateCategoryStatus(isActive)) {
            throw createError('Tr???ng th??i danh m???c kh??ng h???p l???.');
        }

        const category = await Category.findById(id);

        if (!category) {
            throw createError('Kh??ng t??m th???y danh m???c.', 404);
        }

        return Category.updateStatus(id, isActive ? 1 : 0);
    },

    async deleteCategory(id) {
        if (!validateId(id)) {
            throw createError('ID danh m???c kh??ng h???p l???.');
        }

        const category = await Category.findById(id);

        if (!category) {
            throw createError('Kh??ng t??m th???y danh m???c.', 404);
        }

        try {
            await Category.delete(id);
            return true;
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                throw createError(
                    'Kh??ng th??? x??a danh m???c v?? ??ang c?? d???ch v??? thu???c danh m???c n??y.',
                    409
                );
            }

            throw error;
        }
    },

    // =========================
    // CARE SERVICES
    // =========================

    async getCareServices(isAdmin = false) {
        return CareService.findAll(!isAdmin);
    },

    async getCareServiceById(id) {
        if (!validateId(id)) {
            throw createError('ID d???ch v??? kh??ng h???p l???.');
        }

        const service = await CareService.findById(id);

        if (!service) {
            throw createError('Kh??ng t??m th???y d???ch v???.', 404);
        }

        return service;
    },

    async getServicesByCategory(categoryId, isAdmin = false) {
        if (!validateId(categoryId)) {
            throw createError('ID danh m???c kh??ng h???p l???.');
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            throw createError('Kh??ng t??m th???y danh m???c.', 404);
        }

        if (!isAdmin && !category.is_active) {
            return [];
        }

        return CareService.findByCategory(
            categoryId,
            !isAdmin
        );
    },

    async createCareService(data) {
        const errors = validateCareService(data);

        if (errors.length) {
            throw createError(errors.join(' '));
        }

        const category = await Category.findById(data.category_id);

        if (!category) {
            throw createError('Danh m???c kh??ng t???n t???i.', 404);
        }

        if (!category.is_active) {
            throw createError('Kh??ng th??? th??m d???ch v??? v??o danh m???c ???? ng???ng ho???t ?????ng.');
        }

        return CareService.create({
            category_id: Number(data.category_id),
            name: data.name.trim(),
            description: data.description?.trim() || null,
            price_per_hour: Number(data.price_per_hour)
        });
    },

    async updateCareService(id, data) {
        if (!validateId(id)) {
            throw createError('ID d???ch v??? kh??ng h???p l???.');
        }

        const errors = validateCareService(data);

        if (errors.length) {
            throw createError(errors.join(' '));
        }

        const service = await CareService.findById(id);

        if (!service) {
            throw createError('Kh??ng t??m th???y d???ch v???.', 404);
        }

        const category = await Category.findById(data.category_id);

        if (!category) {
            throw createError('Danh m???c kh??ng t???n t???i.', 404);
        }

        if (!category.is_active) {
            throw createError('Kh??ng th??? chuy???n d???ch v??? v??o danh m???c ???? ng???ng ho???t ?????ng.');
        }

        return CareService.update(id, {
            category_id: Number(data.category_id),
            name: data.name.trim(),
            description: data.description?.trim() || null,
            price_per_hour: Number(data.price_per_hour)
        });
    },

    async updateCareServiceStatus(id, status) {
        if (!validateId(id)) {
            throw createError('ID d???ch v??? kh??ng h???p l???.');
        }

        if (!validateServiceStatus(status)) {
            throw createError('Tr???ng th??i d???ch v??? ph???i l?? ACTIVE ho???c INACTIVE.');
        }

        const service = await CareService.findById(id);

        if (!service) {
            throw createError('Kh??ng t??m th???y d???ch v???.', 404);
        }

        return CareService.updateStatus(id, status);
    },

    async deleteCareService(id) {
        if (!validateId(id)) {
            throw createError('ID d???ch v??? kh??ng h???p l???.');
        }

        const service = await CareService.findById(id);

        if (!service) {
            throw createError('Kh??ng t??m th???y d???ch v???.', 404);
        }

        await CareService.delete(id);
        return true;
    }
};

module.exports = careService;
