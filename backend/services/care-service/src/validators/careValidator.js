
const validateId = (id) => {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
};

const validateCategory = (data) => {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        errors.push('T??n danh m???c kh??ng ???????c ????? tr???ng.');
    } else if (data.name.trim().length > 150) {
        errors.push('T??n danh m???c t???i ??a 150 k?? t???.');
    }

    if (
        data.description !== undefined &&
        data.description !== null &&
        typeof data.description !== 'string'
    ) {
        errors.push('M?? t??? danh m???c kh??ng h???p l???.');
    }

    return errors;
};

const validateCareService = (data) => {
    const errors = [];

    const categoryId = Number(data.category_id);
    const price = Number(data.price_per_hour);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        errors.push('Danh m???c d???ch v??? kh??ng h???p l???.');
    }

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        errors.push('T??n d???ch v??? kh??ng ???????c ????? tr???ng.');
    } else if (data.name.trim().length > 200) {
        errors.push('T??n d???ch v??? t???i ??a 200 k?? t???.');
    }

    if (!Number.isFinite(price) || price < 0 || price > 9999999999.99) {
        errors.push('Gi?? d???ch v??? kh??ng h???p l???.');
    }

    if (
        data.description !== undefined &&
        data.description !== null &&
        typeof data.description !== 'string'
    ) {
        errors.push('M?? t??? d???ch v??? kh??ng h???p l???.');
    }

    return errors;
};

const validateCategoryStatus = (value) => {
    return value === 0 || value === 1 ||
        value === true || value === false;
};

const validateServiceStatus = (value) => {
    return value === 'ACTIVE' || value === 'INACTIVE';
};

module.exports = {
    validateId,
    validateCategory,
    validateCareService,
    validateCategoryStatus,
    validateServiceStatus
};
