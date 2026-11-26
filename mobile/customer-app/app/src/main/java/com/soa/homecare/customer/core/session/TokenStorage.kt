package com.soa.homecare.customer.core.session

import android.content.Context
import android.content.SharedPreferences

class TokenStorage(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun saveToken(token: String?) {
        prefs.edit().putString(KEY_ACCESS_TOKEN, token?.trim()?.ifEmpty { null }).apply()
    }

    fun getToken(): String? {
        return prefs.getString(KEY_ACCESS_TOKEN, null)?.trim()?.ifEmpty { null }
    }

    fun saveRole(role: String?) {
        prefs.edit().putString(KEY_USER_ROLE, role?.trim()?.uppercase()?.ifEmpty { null }).apply()
    }

    fun getRole(): String? {
        return prefs.getString(KEY_USER_ROLE, null)?.trim()?.uppercase()?.ifEmpty { null }
    }

    fun clear() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val PREFS_NAME = "soa_customer_session_prefs"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_USER_ROLE = "user_role"
    }
}