package com.soa.homecare.caregiver.core.network

import retrofit2.HttpException
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

object NetworkErrorMapper {

    fun toMessage(throwable: Throwable): String {
        return when (throwable) {
            is SocketTimeoutException -> "Kết nối máy chủ quá thời gian chờ. Vui lòng thử lại."
            is UnknownHostException -> "Không thể kết nối tới máy chủ. Kiểm tra mạng hoặc địa chỉ gateway."
            is IOException -> "Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền."
            is HttpException -> when (throwable.code()) {
                400 -> "Dữ liệu gửi lên chưa hợp lệ."
                401 -> "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
                403 -> "Bạn không có quyền thực hiện thao tác này."
                404 -> "Không tìm thấy tài nguyên yêu cầu."
                in 500..599 -> "Máy chủ đang gặp sự cố (${throwable.code()}). Vui lòng thử lại sau."
                else -> "Yêu cầu thất bại với mã lỗi ${throwable.code()}."
            }
            else -> throwable.message?.takeIf { it.isNotBlank() } ?: "Đã xảy ra lỗi không xác định."
        }
    }
}