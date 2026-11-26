package com.soa.homecare.caregiver.core.model

data class LoginRequest(
    val identifier: String,
    val password: String
)

data class CredentialUploadItem(
    val title: String,           // Tên chứng chỉ / bằng cấp (VD: Điều dưỡng đa khoa, Chứng chỉ sơ cứu)
    val issuer: String? = null,  // Nơi cấp / số hiệu (tùy chọn)
    val year: String? = null,    // Năm cấp (tùy chọn)
    val photoUriString: String   // URI ảnh chụp bắt buộc, gửi lên backend khi bấm Đăng ký
)

data class RegisterCaregiverRequest(
    val fullName: String,
    val email: String,
    val phone: String?,
    val dateOfBirth: String?,
    val gender: String?, // "MALE" | "FEMALE" | "OTHER" | null
    val experienceYears: Int = 0,
    val introduction: String?,
    val credentials: List<CredentialUploadItem> = emptyList(), // Rỗng nếu không nhập, có thể nhiều phần tử
    val password: String
)

data class AuthSessionData(
    val accessToken: String,
    val role: String, // "CAREGIVER"
    val displayName: String,
    val accountStatus: String = "ACTIVE"
)