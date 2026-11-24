const { AppError } = require('../middlewares/errorMiddleware');

const VERIFICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

const isPositiveInt = (val) => Number.isInteger(Number(val)) && Number(val) > 0;
const isNonNegativeNumber = (val) =>
  typeof val !== 'boolean' && val !== '' && val !== null && !Number.isNaN(Number(val)) && Number(val) >= 0;

const validateIdParam = (paramName = 'id') => (req, res, next) => {
  const raw = req.params[paramName];
  if (!isPositiveInt(raw)) {
    return next(new AppError(`Tham số ${paramName} phải là số nguyên dương`, 400));
  }
  req.params[paramName] = Number(raw);
  return next();
};

const validateCreateProfile = (req, res, next) => {
  const errors = [];
  const { user_id, experience_years, introduction, qualification, license_number } = req.body;

  if (user_id !== undefined && !isPositiveInt(user_id)) {
    errors.push('user_id phải là số nguyên dương');
  }
  if (experience_years !== undefined && (!Number.isInteger(Number(experience_years)) || Number(experience_years) < 0)) {
    errors.push('experience_years phải là số nguyên >= 0');
  }
  if (introduction !== undefined && introduction !== null && typeof introduction !== 'string') {
    errors.push('introduction phải là chuỗi ký tự');
  }
  if (qualification !== undefined && qualification !== null && typeof qualification !== 'string') {
    errors.push('qualification phải là chuỗi ký tự');
  }
  if (license_number !== undefined && license_number !== null && typeof license_number !== 'string') {
    errors.push('license_number phải là chuỗi ký tự');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu hồ sơ người chăm sóc không hợp lệ', 400, errors));
  }
  return next();
};

const validateUpdateProfile = (req, res, next) => {
  const errors = [];
  const { experience_years, introduction, qualification, license_number } = req.body;

  if (experience_years !== undefined && (!Number.isInteger(Number(experience_years)) || Number(experience_years) < 0)) {
    errors.push('experience_years phải là số nguyên >= 0');
  }
  if (introduction !== undefined && introduction !== null && typeof introduction !== 'string') {
    errors.push('introduction phải là chuỗi ký tự');
  }
  if (qualification !== undefined && qualification !== null && typeof qualification !== 'string') {
    errors.push('qualification phải là chuỗi ký tự');
  }
  if (license_number !== undefined && license_number !== null && typeof license_number !== 'string') {
    errors.push('license_number phải là chuỗi ký tự');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu cập nhật hồ sơ không hợp lệ', 400, errors));
  }
  return next();
};

const validateVerifyStatus = (req, res, next) => {
  const errors = [];
  const { verification_status, rejection_reason } = req.body;

  if (!verification_status || !VERIFICATION_STATUSES.includes(String(verification_status).toUpperCase())) {
    errors.push(`verification_status phải là một trong các giá trị: ${VERIFICATION_STATUSES.join(', ')}`);
  }

  if (
    String(verification_status).toUpperCase() === 'REJECTED' &&
    (!rejection_reason || String(rejection_reason).trim() === '')
  ) {
    errors.push('rejection_reason là bắt buộc khi từ chối (REJECTED)');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu xác thực không hợp lệ', 400, errors));
  }

  req.body.verification_status = String(verification_status).toUpperCase();
  return next();
};

const validateCreateDocument = (req, res, next) => {
  const errors = [];
  const { document_type, document_name, document_url } = req.body;

  if (!document_type || typeof document_type !== 'string' || !document_type.trim()) {
    errors.push('document_type là bắt buộc');
  }
  if (!document_name || typeof document_name !== 'string' || !document_name.trim()) {
    errors.push('document_name là bắt buộc');
  }
  if (!document_url || typeof document_url !== 'string' || !document_url.trim()) {
    errors.push('document_url là bắt buộc');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu giấy tờ không hợp lệ', 400, errors));
  }
  return next();
};

const validateAddService = (req, res, next) => {
  const errors = [];
  const { care_service_id, custom_price } = req.body;

  if (!isPositiveInt(care_service_id)) {
    errors.push('care_service_id phải là số nguyên dương');
  }
  if (custom_price !== undefined && custom_price !== null && !isNonNegativeNumber(custom_price)) {
    errors.push('custom_price phải là số >= 0 hoặc null');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu dịch vụ người chăm sóc không hợp lệ', 400, errors));
  }
  return next();
};

const validateUpdateServicePrice = (req, res, next) => {
  const { custom_price } = req.body;
  if (custom_price !== null && !isNonNegativeNumber(custom_price)) {
    return next(new AppError('custom_price phải là số >= 0 hoặc null', 400));
  }
  return next();
};

const validateAddArea = (req, res, next) => {
  const errors = [];
  const { province, district } = req.body;

  if (!province || typeof province !== 'string' || !province.trim()) {
    errors.push('province là bắt buộc');
  }
  if (district !== undefined && district !== null && typeof district !== 'string') {
    errors.push('district phải là chuỗi ký tự hoặc null');
  }

  if (errors.length > 0) {
    return next(new AppError('Dữ liệu khu vực phục vụ không hợp lệ', 400, errors));
  }
  return next();
};

module.exports = {
  validateIdParam,
  validateCreateProfile,
  validateUpdateProfile,
  validateVerifyStatus,
  validateCreateDocument,
  validateAddService,
  validateUpdateServicePrice,
  validateAddArea,
};