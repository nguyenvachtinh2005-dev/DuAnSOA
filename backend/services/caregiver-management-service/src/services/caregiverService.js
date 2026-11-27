const {
  CaregiverProfile,
  CaregiverDocument,
  CaregiverService: CaregiverServiceModel,
  CaregiverServiceArea,
} = require('../models');
const { AppError } = require('../middleware/errorMiddleware');

class CaregiverService {
  static async _getProfileOrFail(profileId) {
    const profile = await CaregiverProfile.findById(profileId);
    if (!profile) {
      throw new AppError('Không tìm thấy hồ sơ người chăm sóc', 404);
    }
    return profile;
  }

  static _assertOwnerOrAdmin(profile, currentUser) {
    if (!currentUser) {
      throw new AppError('Chưa xác thực người dùng', 401);
    }
    const isAdmin = currentUser.role === 'ADMIN';
    const isOwner = Number(profile.user_id) === Number(currentUser.id);
    if (!isAdmin && !isOwner) {
      throw new AppError('Bạn không có quyền thao tác trên hồ sơ của người khác', 403);
    }
  }

  static async listProfiles(query, currentUser) {
    const filter = {};
    if (query.verification_status) {
      filter.verificationStatus = String(query.verification_status).toUpperCase();
    }

    const profiles = await CaregiverProfile.findAll(filter);

    // Người dùng thường chỉ xem hồ sơ của chính mình; ADMIN xem toàn bộ
    if (currentUser.role !== 'ADMIN') {
      return profiles.filter((p) => Number(p.user_id) === Number(currentUser.id));
    }

    return profiles;
  }

  static async getMyProfile(currentUser) {
    const profile = await CaregiverProfile.findByUserId(currentUser.id);
    if (!profile) {
      throw new AppError('Bạn chưa tạo hồ sơ người chăm sóc', 404);
    }
    return profile;
  }

  static async getProfileById(profileId, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);
    return profile;
  }

  static async createProfile(data, currentUser) {
    const targetUserId =
      currentUser.role === 'ADMIN' && data.user_id ? Number(data.user_id) : Number(currentUser.id);

    const existing = await CaregiverProfile.findByUserId(targetUserId);
    if (existing) {
      throw new AppError('Người dùng này đã có hồ sơ người chăm sóc', 409);
    }

    return CaregiverProfile.create({
      user_id: targetUserId,
      introduction: data.introduction ?? null,
      qualification: data.qualification ?? null,
      experience_years: data.experience_years ?? 0,
      license_number: data.license_number ?? null,
      verification_status: 'PENDING',
      rejection_reason: null,
      approved_by: null,
      approved_at: null,
    });
  }

  static _normalizeUpdateProfileInput(data = {}) {
    const normalized = {};

    if (data.introduction !== undefined) {
      normalized.introduction =
        data.introduction === null ? null : String(data.introduction).trim();
    }

    if (data.qualification !== undefined) {
      normalized.qualification =
        data.qualification === null ? null : String(data.qualification).trim();
    }

    if (data.experience_years !== undefined) {
      if (data.experience_years === null) {
        normalized.experience_years = null;
      } else {
        const years = Number(data.experience_years);
        if (!Number.isFinite(years) || years < 0) {
          throw new AppError('Số năm kinh nghiệm phải là số lớn hơn hoặc bằng 0', 400);
        }
        normalized.experience_years = years;
      }
    }

    if (data.license_number !== undefined) {
      normalized.license_number =
        data.license_number === null ? null : String(data.license_number).trim();
    }

    return normalized;
  }

  static async updateProfile(profileId, data, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);

    const payload = this._normalizeUpdateProfileInput(data);

    // Nếu người chăm sóc sửa hồ sơ sau khi bị từ chối, đưa về PENDING để duyệt lại
    if (currentUser.role !== 'ADMIN' && profile.verification_status === 'REJECTED') {
      payload.verification_status = 'PENDING';
      payload.rejection_reason = null;
      payload.approved_by = null;
      payload.approved_at = null;
    }

    return CaregiverProfile.updateById(profileId, payload);
  }

  static async deleteProfile(profileId, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);

    const deleted = await CaregiverProfile.deleteById(profileId);
    if (!deleted) {
      throw new AppError('Không thể xóa hồ sơ người chăm sóc', 400);
    }
    return { deleted: true, id: profileId };
  }

  static async verifyProfile(profileId, { verification_status, rejection_reason }, adminUser) {
    await this._getProfileOrFail(profileId);

    const isApproved = verification_status === 'APPROVED';
    return CaregiverProfile.updateById(profileId, {
      verification_status,
      rejection_reason: isApproved ? null : rejection_reason.trim(),
      approved_by: isApproved ? Number(adminUser.id) : null,
      approved_at: isApproved ? new Date() : null,
    });
  }

  // --- Giấy tờ (caregiver_documents) ---
  static async listDocuments(profileId, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);
    return CaregiverDocument.findByCaregiverId(profileId);
  }

  static async addDocument(profileId, data, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);

    return CaregiverDocument.create({
      caregiver_id: profileId,
      document_type: data.document_type.trim(),
      document_name: data.document_name.trim(),
      document_url: data.document_url.trim(),
      verification_status: 'PENDING',
      rejection_reason: null,
      verified_at: null,
    });
  }

  static async verifyDocument(docId, { verification_status, rejection_reason }) {
    const doc = await CaregiverDocument.findById(docId);
    if (!doc) {
      throw new AppError('Không tìm thấy giấy tờ của người chăm sóc', 404);
    }

    const isApproved = verification_status === 'APPROVED';
    return CaregiverDocument.updateById(docId, {
      verification_status,
      rejection_reason: isApproved ? null : rejection_reason.trim(),
      verified_at: isApproved ? new Date() : null,
    });
  }

  static async deleteDocument(docId, currentUser) {
    const doc = await CaregiverDocument.findById(docId);
    if (!doc) {
      throw new AppError('Không tìm thấy giấy tờ của người chăm sóc', 404);
    }

    const profile = await this._getProfileOrFail(doc.caregiver_id);
    this._assertOwnerOrAdmin(profile, currentUser);

    await CaregiverDocument.deleteById(docId);
    return { deleted: true, id: docId };
  }

  // --- Dịch vụ (caregiver_services) ---
  static async listServices(profileId, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);
    return CaregiverServiceModel.findByCaregiverId(profileId);
  }

  static async addService(profileId, data, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);

    if (currentUser.role !== 'ADMIN' && profile.verification_status !== 'APPROVED') {
      throw new AppError('Hồ sơ người chăm sóc cần được duyệt (APPROVED) trước khi đăng ký dịch vụ', 400);
    }

    const existing = await CaregiverServiceModel.findByCaregiverAndService(
      profileId,
      Number(data.care_service_id)
    );
    if (existing) {
      throw new AppError('Dịch vụ này đã được liên kết với hồ sơ người chăm sóc', 409);
    }

    return CaregiverServiceModel.create({
      caregiver_id: profileId,
      care_service_id: Number(data.care_service_id),
      custom_price: data.custom_price ?? null,
    });
  }

  static async updateServicePrice(serviceLinkId, customPrice, currentUser) {
    const link = await CaregiverServiceModel.findById(serviceLinkId);
    if (!link) {
      throw new AppError('Không tìm thấy liên kết dịch vụ của người chăm sóc', 404);
    }

    const profile = await this._getProfileOrFail(link.caregiver_id);
    this._assertOwnerOrAdmin(profile, currentUser);

    return CaregiverServiceModel.updateCustomPrice(serviceLinkId, customPrice);
  }

  static async removeService(serviceLinkId, currentUser) {
    const link = await CaregiverServiceModel.findById(serviceLinkId);
    if (!link) {
      throw new AppError('Không tìm thấy liên kết dịch vụ của người chăm sóc', 404);
    }

    const profile = await this._getProfileOrFail(link.caregiver_id);
    this._assertOwnerOrAdmin(profile, currentUser);

    await CaregiverServiceModel.deleteById(serviceLinkId);
    return { deleted: true, id: serviceLinkId };
  }

  // --- Khu vực phục vụ (caregiver_service_areas) ---
  static async listAreas(profileId, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);
    return CaregiverServiceArea.findByCaregiverId(profileId);
  }

  static async addArea(profileId, data, currentUser) {
    const profile = await this._getProfileOrFail(profileId);
    this._assertOwnerOrAdmin(profile, currentUser);

    return CaregiverServiceArea.create({
      caregiver_id: profileId,
      province: data.province.trim(),
      district: data.district ? data.district.trim() : null,
    });
  }

  static async removeArea(areaId, currentUser) {
    const area = await CaregiverServiceArea.findById(areaId);
    if (!area) {
      throw new AppError('Không tìm thấy khu vực phục vụ', 404);
    }

    const profile = await this._getProfileOrFail(area.caregiver_id);
    this._assertOwnerOrAdmin(profile, currentUser);

    await CaregiverServiceArea.deleteById(areaId);
    return { deleted: true, id: areaId };
  }
}

module.exports = CaregiverService;