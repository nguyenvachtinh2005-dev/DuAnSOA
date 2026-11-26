package com.soa.homecare.customer.data.repository

import com.soa.homecare.customer.core.model.AuthSessionData
import com.soa.homecare.customer.core.model.LoginRequest
import com.soa.homecare.customer.core.model.RegisterCustomerRequest
import com.soa.homecare.customer.core.session.SessionManager
import com.soa.homecare.customer.domain.repository.AuthRepository
import kotlinx.coroutines.delay
import kotlin.time.Duration.Companion.milliseconds

class FakeAuthRepository(
    private val sessionManager: SessionManager,
    private val defaultRole: String = "CUSTOMER"
) : AuthRepository {

    override suspend fun login(request: LoginRequest): Result<AuthSessionData> {
        delay(600.milliseconds)
        val cleanIdentifier = request.identifier.trim()
        if (cleanIdentifier.isEmpty() || request.password.length < 4) {
            return Result.failure(
                IllegalArgumentException("Vui lòng nhập email/số điện thoại và mật khẩu hợp lệ.")
            )
        }

        val sessionData = AuthSessionData(
            accessToken = "fake_token_${System.currentTimeMillis()}",
            role = defaultRole,
            displayName = cleanIdentifier
        )
        sessionManager.startSession(
            token = sessionData.accessToken,
            role = sessionData.role
        )
        return Result.success(sessionData)
    }

    override suspend fun registerCustomer(request: RegisterCustomerRequest): Result<AuthSessionData> {
        delay(700.milliseconds)
        val cleanEmail = request.email.trim()
        if (cleanEmail.equals("existing@gmail.com", ignoreCase = true)) {
            return Result.failure(
                IllegalArgumentException("Email này đã tồn tại trong hệ thống.")
            )
        }

        val sessionData = AuthSessionData(
            accessToken = "fake_reg_token_${System.currentTimeMillis()}",
            role = "CUSTOMER",
            displayName = request.fullName.trim().ifEmpty { cleanEmail }
        )
        return Result.success(sessionData)
    }
}