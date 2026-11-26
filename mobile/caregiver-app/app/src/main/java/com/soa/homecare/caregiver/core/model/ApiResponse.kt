package com.soa.homecare.caregiver.core.model

data class ApiResponse<T>(
    val success: Boolean? = null,
    val message: String? = null,
    val data: T? = null
)