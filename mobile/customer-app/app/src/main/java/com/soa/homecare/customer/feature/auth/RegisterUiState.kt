package com.soa.homecare.customer.feature.auth

enum class GenderOption(val apiValue: String, val label: String) {
    MALE("MALE", "Nam"),
    FEMALE("FEMALE", "Nữ"),
    OTHER("OTHER", "Khác")
}

data class RegisterUiState(
    val fullName: String = "",
    val email: String = "",
    val phone: String = "",
    val dateOfBirth: String = "", // Định dạng hiển thị/nhập YYYY-MM-DD hoặc DD/MM/YYYY
    val gender: GenderOption? = null,
    val password: String = "",
    val confirmPassword: String = "",
    val isPasswordVisible: Boolean = false,
    val isConfirmPasswordVisible: Boolean = false,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isRegisterSuccess: Boolean = false
)