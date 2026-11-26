package com.soa.homecare.caregiver.domain.repository

import com.soa.homecare.caregiver.core.model.AuthSessionData
import com.soa.homecare.caregiver.core.model.LoginRequest
import com.soa.homecare.caregiver.core.model.RegisterCaregiverRequest

interface CaregiverAuthRepository {
    suspend fun login(request: LoginRequest): Result<AuthSessionData>
    suspend fun registerCaregiver(request: RegisterCaregiverRequest): Result<AuthSessionData>
}