package com.soa.homecare.caregiver.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.soa.homecare.caregiver.core.model.LoginRequest
import com.soa.homecare.caregiver.domain.repository.CaregiverAuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class CaregiverLoginViewModel(
    private val repository: CaregiverAuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CaregiverLoginUiState())
    val uiState: StateFlow<CaregiverLoginUiState> = _uiState.asStateFlow()

    fun onIdentifierChange(value: String) {
        _uiState.update { it.copy(identifier = value, errorMessage = null) }
    }

    fun onPasswordChange(value: String) {
        _uiState.update { it.copy(password = value, errorMessage = null) }
    }

    fun togglePasswordVisibility() {
        _uiState.update { it.copy(isPasswordVisible = !it.isPasswordVisible) }
    }

    fun consumeLoginSuccess() {
        _uiState.update { it.copy(isLoginSuccess = false) }
    }

    fun submitLogin() {
        val current = _uiState.value
        val cleanId = current.identifier.trim()
        if (cleanId.isEmpty() || current.password.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Vui lòng nhập đầy đủ tài khoản và mật khẩu.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            repository.login(LoginRequest(cleanId, current.password)).fold(
                onSuccess = {
                    _uiState.update { it.copy(isLoading = false, isLoginSuccess = true) }
                },
                onFailure = { err ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = err.message ?: "Đăng nhập thất bại."
                        )
                    }
                }
            )
        }
    }
}