package com.soa.homecare.caregiver.data.repository

import com.soa.homecare.caregiver.core.model.AuthSessionData
import com.soa.homecare.caregiver.core.model.LoginRequest
import com.soa.homecare.caregiver.core.model.RegisterCaregiverRequest
import com.soa.homecare.caregiver.core.session.SessionManager
import com.soa.homecare.caregiver.domain.repository.CaregiverAuthRepository
import kotlinx.coroutines.delay
import kotlin.time.Duration.Companion.milliseconds

class FakeCaregiverAuthRepository(
    private val sessionManager: SessionManager
) : CaregiverAuthRepository {

    override suspend fun login(request: LoginRequest): Result<AuthSessionData> {
        delay(600.milliseconds)
        val cleanId = request.identifier.trim()
        if (cleanId.isEmpty() || request.password.length < 4) {
            return Result.failure(
                IllegalArgumentException("Vui lòng nhập email/số điện thoại và mật khẩu hợp lệ.")
            )
        }

        val sessionData = AuthSessionData(
            accessToken = "fake_caregiver_token_${System.currentTimeMillis()}",
            role = "CAREGIVER",
            displayName = cleanId
        )
        sessionManager.startSession(
            token = sessionData.accessToken,
            role = sessionData.role
        )
        return Result.success(sessionData)
    }

    override suspend fun registerCaregiver(request: RegisterCaregiverRequest): Result<AuthSessionData> {
        delay(700.milliseconds)
        val cleanEmail = request.email.trim()
        if (cleanEmail.equals("caregiver.exists@gmail.com", ignoreCase = true)) {
            return Result.failure(
                IllegalArgumentException("Email này đã được sử dụng cho tài khoản người chăm sóc.")
            )
        }

        val sessionData = AuthSessionData(
            accessToken = "fake_caregiver_reg_${System.currentTimeMillis()}",
            role = "CAREGIVER",
            displayName = request.fullName.trim().ifEmpty { cleanEmail }
        )
        return Result.success(sessionData)
    }
}