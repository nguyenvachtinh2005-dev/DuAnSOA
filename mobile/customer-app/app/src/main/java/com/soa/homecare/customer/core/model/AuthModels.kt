package com.soa.homecare.customer.core.model

data class LoginRequest(
    val identifier: String,
    val password: String
)

data class RegisterCustomerRequest(
    val fullName: String,
    val email: String,
    val phone: String?,
    val dateOfBirth: String?, // YYYY-MM-DD khớp cột DATE trong user_profiles
    val gender: String?,      // "MALE" | "FEMALE" | "OTHER" khớp ENUM user_profiles
    val password: String
)

data class AuthSessionData(
    val accessToken: String,
    val role: String,          // "CUSTOMER" | "CAREGIVER" | "ADMIN"
    val displayName: String,
    val accountStatus: String = "ACTIVE" // "PENDING" | "ACTIVE" | "LOCKED"
)