package com.soa.homecare.caregiver.feature.auth

enum class GenderOption(val apiValue: String, val label: String) {
    MALE("MALE", "Nam"),
    FEMALE("FEMALE", "Nữ"),
    OTHER("OTHER", "Khác")
}

data class AddedCredential(
    val id: Long,
    val title: String,
    val issuer: String = "",
    val year: String = "",
    val photoUriString: String
)

data class CredentialDraft(
    val title: String = "",
    val issuer: String = "",
    val year: String = "",
    val capturedPhotoUri: String? = null,
    val pendingCameraUri: String? = null
)

data class CaregiverRegisterUiState(
    val fullName: String = "",
    val email: String = "",
    val phone: String = "",
    val dateOfBirth: String = "",
    val gender: GenderOption? = null,
    val experienceYears: String = "0",
    val introduction: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val isPasswordVisible: Boolean = false,
    val isConfirmPasswordVisible: Boolean = false,
    val credentials: List<AddedCredential> = emptyList(),
    val currentCredential: CredentialDraft = CredentialDraft(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isRegisterSuccess: Boolean = false
)