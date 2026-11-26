package com.soa.homecare.caregiver.core.network

import com.soa.homecare.caregiver.core.session.SessionManager
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(
    private val sessionManager: SessionManager,
    private val clearSessionOnUnauthorized: Boolean = false
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = sessionManager.getAccessToken()

        val requestToSend = if (!token.isNullOrBlank() && originalRequest.header("Authorization") == null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        val response = chain.proceed(requestToSend)

        if (response.code == 401 && clearSessionOnUnauthorized) {
            sessionManager.clearSession()
        }

        return response
    }
}