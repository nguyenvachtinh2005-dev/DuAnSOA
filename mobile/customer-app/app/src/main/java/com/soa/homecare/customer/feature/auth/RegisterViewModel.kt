package com.soa.homecare.customer.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.soa.homecare.customer.domain.repository.AuthRepository
import com.soa.homecare.customer.core.model.RegisterCustomerRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class RegisterViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()

    fun onFullNameChange(value: String) {
        _uiState.update { it.copy(fullName = value, errorMessage = null) }
    }

    fun onEmailChange(value: String) {
        _uiState.update { it.copy(email = value, errorMessage = null) }
    }

    fun onPhoneChange(value: String) {
        _uiState.update { it.copy(phone = value, errorMessage = null) }
    }

    fun onDateOfBirthChange(value: String) {
        _uiState.update { it.copy(dateOfBirth = value, errorMessage = null) }
    }

    fun onGenderSelect(gender: GenderOption?) {
        _uiState.update { it.copy(gender = gender, errorMessage = null) }
    }

    fun onPasswordChange(value: String) {
        _uiState.update { it.copy(password = value, errorMessage = null) }
    }

    fun onConfirmPasswordChange(value: String) {
        _uiState.update { it.copy(confirmPassword = value, errorMessage = null) }
    }

    fun onTogglePasswordVisibility() {
        _uiState.update { it.copy(isPasswordVisible = !it.isPasswordVisible) }
    }

    fun onToggleConfirmPasswordVisibility() {
        _uiState.update { it.copy(isConfirmPasswordVisible = !it.isConfirmPasswordVisible) }
    }

    fun onConsumeRegisterSuccess() {
        _uiState.update { it.copy(isRegisterSuccess = false) }
    }

    fun onRegisterClick() {
        val current = _uiState.value
        val trimmedName = current.fullName.trim()
        val trimmedEmail = current.email.trim()
        val trimmedPhone = current.phone.trim()

        if (trimmedName.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Vui lòng nhập họ và tên.") }
            return
        }
        if (trimmedEmail.isEmpty() || !trimmedEmail.contains("@")) {
            _uiState.update { it.copy(errorMessage = "Vui lòng nhập địa chỉ email hợp lệ.") }
            return
        }
        if (current.password.length < 6) {
            _uiState.update { it.copy(errorMessage = "Mật khẩu phải có ít nhất 6 ký tự.") }
            return
        }
        if (current.password != current.confirmPassword) {
            _uiState.update { it.copy(errorMessage = "Mật khẩu xác nhận không khớp.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = authRepository.registerCustomer(
                RegisterCustomerRequest(
                    fullName = trimmedName,
                    email = trimmedEmail,
                    phone = trimmedPhone.ifEmpty { null },
                    dateOfBirth = current.dateOfBirth.trim().ifEmpty { null },
                    gender = current.gender?.apiValue,
                    password = current.password
                )
            )
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isRegisterSuccess = true,
                            errorMessage = null
                        )
                    }
                },
                onFailure = { throwable ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = throwable.message ?: "Đăng ký thất bại, vui lòng thử lại."
                        )
                    }
                }
            )
        }
    }
}