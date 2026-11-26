package com.soa.homecare.caregiver.core.session

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SessionManager(private val tokenStorage: TokenStorage) {

    private val _isAuthenticated = MutableStateFlow(tokenStorage.getToken() != null)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    fun getAccessToken(): String? = tokenStorage.getToken()

    fun getRole(): String? = tokenStorage.getRole()

    fun startSession(token: String, role: String = "CAREGIVER") {
        tokenStorage.saveToken(token)
        tokenStorage.saveRole(role)
        _isAuthenticated.value = tokenStorage.getToken() != null
    }

    fun clearSession() {
        tokenStorage.clear()
        _isAuthenticated.value = false
    }
}