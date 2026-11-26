package com.soa.homecare.customer

import android.app.Application
import com.soa.homecare.customer.core.session.SessionManager
import com.soa.homecare.customer.core.session.TokenStorage

class CustomerApplication : Application() {

    lateinit var tokenStorage: TokenStorage
        private set

    lateinit var sessionManager: SessionManager
        private set

    override fun onCreate() {
        super.onCreate()
        tokenStorage = TokenStorage(applicationContext)
        sessionManager = SessionManager(tokenStorage)
    }
}