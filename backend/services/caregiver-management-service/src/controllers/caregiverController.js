const CaregiverService = require('../services/caregiverService');

class CaregiverController {
  static async listProfiles(req, res, next) {
    try {
      const data = await CaregiverService.listProfiles(req.query, req.user);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getMyProfile(req, res, next) {
    try {
      const data = await CaregiverService.getMyProfile(req.user);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getProfileById(req, res, next) {
    try {
      const data = await CaregiverService.getProfileById(req.params.id, req.user);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async createProfile(req, res, next) {
    try {
      const data = await CaregiverService.createProfile(req.body, req.user);
      res.status(201).json({ success: true, message: 'Tạo hồ sơ người chăm sóc thành công', data });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const data = await CaregiverService.updateProfile(req.params.id, req.body, req.user);
      res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProfile(req, res, next) {
    try {
      const data = await CaregiverService.deleteProfile(req.params.id, req.user);
      res.status(200).json({ success: true, message: 'Xóa hồ sơ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  static async verifyProfile(req, res, next) {
    try {
      const data = await CaregiverService.verifyProfile(req.params.id, req.body, req.user);
      res.status(200).json({ success: true, message: 'Cập nhật trạng thái duyệt hồ sơ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  // --- Giấy tờ ---
  static async listDocuments(req, res, next) {
    try {
      const data = await CaregiverService.listDocuments(req.params.id, req.user);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async addDocument(req, res, next) {
    try {
      const data = await CaregiverService.addDocument(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, message: 'Thêm giấy tờ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  static async verifyDocument(req, res, next) {
    try {
      const data = await CaregiverService.verifyDocument(req.params.docId, req.body);
      res.status(200).json({ success: true, message: 'Cập nhật trạng thái duyệt giấy tờ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  static async deleteDocument(req, res, next) {
    try {
      const data = await CaregiverService.deleteDocument(req.params.docId, req.user);
      res.status(200).json({ success: true, message: 'Xóa giấy tờ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  // --- Dịch vụ ---
  static async listServices(req, res, next) {
    try {
      const data = await CaregiverService.listServices(req.params.id, req.user);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async addService(req, res, next) {
    try {
      const data = await CaregiverService.addService(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, message: 'Liên kết dịch vụ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  static async updateServicePrice(req, res, next) {
    try {
      const data = await CaregiverService.updateServicePrice(
        req.params.serviceLinkId,
        req.body.custom_price,
        req.user
      );
      res.status(200).json({ success: true, message: 'Cập nhật giá dịch vụ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  static async removeService(req, res, next) {
    try {
      const data = await CaregiverService.removeService(req.params.serviceLinkId, req.user);
      res.status(200).json({ success: true, message: 'Gỡ dịch vụ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  // --- Khu vực ---
  static async listAreas(req, res, next) {
    try {
      const data = await CaregiverService.listAreas(req.params.id, req.user);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async addArea(req, res, next) {
    try {
      const data = await CaregiverService.addArea(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, message: 'Thêm khu vực phục vụ thành công', data });
    } catch (err) {
      next(err);
    }
  }

  static async removeArea(req, res, next) {
    try {
      const data = await CaregiverService.removeArea(req.params.areaId, req.user);
      res.status(200).json({ success: true, message: 'Xóa khu vực phục vụ thành công', data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CaregiverController;