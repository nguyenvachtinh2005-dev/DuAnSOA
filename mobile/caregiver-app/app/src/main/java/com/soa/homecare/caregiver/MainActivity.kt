package com.soa.homecare.caregiver

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.soa.homecare.caregiver.core.session.SessionManager
import com.soa.homecare.caregiver.core.session.TokenStorage
import com.soa.homecare.caregiver.data.repository.FakeCaregiverAuthRepository
import com.soa.homecare.caregiver.navigation.CaregiverAppNavHost
import com.soa.homecare.caregiver.ui.theme.HomecareCaregiverTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HomecareCaregiverTheme {
                val context = LocalContext.current
                val tokenStorage = remember(context) {
                    TokenStorage(context.applicationContext)
                }
                val sessionManager = remember(tokenStorage) {
                    SessionManager(tokenStorage)
                }
                val repository = remember(sessionManager) {
                    FakeCaregiverAuthRepository(sessionManager)
                }

                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    CaregiverAppNavHost(
                        repository = repository,
                        sessionManager = sessionManager,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}