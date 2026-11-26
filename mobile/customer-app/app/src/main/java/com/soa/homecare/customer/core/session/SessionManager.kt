package com.soa.homecare.customer.core.session

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SessionManager(private val tokenStorage: TokenStorage) {

    private val _isAuthenticated = MutableStateFlow(tokenStorage.getToken() != null)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    fun getAccessToken(): String? = tokenStorage.getToken()

    fun getRole(): String? = tokenStorage.getRole()

    /**
     * Dùng khi đăng nhập thật hoặc khi muốn cấp tạm token test ở giai đoạn chưa nối auth service.
     */
    fun startSession(token: String, role: String? = "CUSTOMER") {
        tokenStorage.saveToken(token)
        tokenStorage.saveRole(role)
        _isAuthenticated.value = tokenStorage.getToken() != null
    }

    /**
     * Xóa phiên hiện tại (không ép điều hướng cưỡng bức ở tầng core để tránh cản trở khi test).
     */
    fun clearSession() {
        tokenStorage.clear()
        _isAuthenticated.value = false
    }
}