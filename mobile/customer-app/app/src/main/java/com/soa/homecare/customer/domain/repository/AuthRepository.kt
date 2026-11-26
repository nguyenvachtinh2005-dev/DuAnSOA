package com.soa.homecare.customer.domain.repository

import com.soa.homecare.customer.core.model.AuthSessionData
import com.soa.homecare.customer.core.model.LoginRequest
import com.soa.homecare.customer.core.model.RegisterCustomerRequest

interface AuthRepository {
    suspend fun login(request: LoginRequest): Result<AuthSessionData>
    suspend fun registerCustomer(request: RegisterCustomerRequest): Result<AuthSessionData>
}