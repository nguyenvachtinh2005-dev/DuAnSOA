package com.soa.homecare.customer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.soa.homecare.customer.core.session.SessionManager
import com.soa.homecare.customer.core.session.TokenStorage
import com.soa.homecare.customer.data.repository.FakeAuthRepository
import com.soa.homecare.customer.navigation.AppNavHost
import com.soa.homecare.customer.ui.theme.CustomerappTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val tokenStorage = TokenStorage(applicationContext)
        val sessionManager = SessionManager(tokenStorage)
        val authRepository = FakeAuthRepository(
            sessionManager = sessionManager,
            defaultRole = "CUSTOMER"
        )

        setContent {
            CustomerappTheme(dynamicColor = false) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavHost(
                        authRepository = authRepository,
                        sessionManager = sessionManager
                    )
                }
            }
        }
    }
}