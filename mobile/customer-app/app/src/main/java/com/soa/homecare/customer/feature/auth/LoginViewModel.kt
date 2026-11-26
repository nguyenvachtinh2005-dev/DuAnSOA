package com.soa.homecare.customer.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.soa.homecare.customer.core.model.LoginRequest
import com.soa.homecare.customer.domain.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class LoginViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun onIdentifierChange(value: String) {
        _uiState.update { it.copy(identifier = value, errorMessage = null) }
    }

    fun onPasswordChange(value: String) {
        _uiState.update { it.copy(password = value, errorMessage = null) }
    }

    fun onTogglePasswordVisibility() {
        _uiState.update { it.copy(isPasswordVisible = !it.isPasswordVisible) }
    }

    fun onConsumeLoginSuccess() {
        _uiState.update { it.copy(isLoginSuccess = false) }
    }

    fun onLoginClick() {
        val current = _uiState.value
        val cleanIdentifier = current.identifier.trim()

        if (cleanIdentifier.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Vui lòng nhập email hoặc số điện thoại.") }
            return
        }
        if (current.password.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Vui lòng nhập mật khẩu.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = authRepository.login(
                LoginRequest(
                    identifier = cleanIdentifier,
                    password = current.password
                )
            )
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isLoginSuccess = true
                        )
                    }
                },
                onFailure = { throwable ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = throwable.message ?: "Đăng nhập thất bại."
                        )
                    }
                }
            )
        }
    }
}