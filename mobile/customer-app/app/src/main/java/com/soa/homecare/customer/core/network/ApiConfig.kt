package com.soa.homecare.customer.core.network

object ApiConfig {
    // 10.0.2.2 trỏ tới localhost của máy host khi chạy Android Emulator
    const val BASE_URL = "http://10.0.2.2:3000/"
    const val CONNECT_TIMEOUT_SECONDS = 20L
    const val READ_TIMEOUT_SECONDS = 20L
    const val WRITE_TIMEOUT_SECONDS = 20L
}