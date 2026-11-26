package com.soa.homecare.caregiver.navigation

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.soa.homecare.caregiver.core.session.SessionManager
import com.soa.homecare.caregiver.domain.repository.CaregiverAuthRepository
import com.soa.homecare.caregiver.feature.auth.CaregiverCredentialScreen
import com.soa.homecare.caregiver.feature.auth.CaregiverLoginScreen
import com.soa.homecare.caregiver.feature.auth.CaregiverLoginViewModel
import com.soa.homecare.caregiver.feature.auth.CaregiverRegisterScreen
import com.soa.homecare.caregiver.feature.auth.CaregiverRegisterViewModel

@Composable
fun CaregiverAppNavHost(
    repository: CaregiverAuthRepository,
    sessionManager: SessionManager,
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    val startDestination = remember(sessionManager) {
        if (sessionManager.getRole() == "CAREGIVER") CaregiverRoutes.HOME else CaregiverRoutes.LOGIN
    }

    val factory = remember(repository) {
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return when {
                    modelClass.isAssignableFrom(CaregiverLoginViewModel::class.java) ->
                        CaregiverLoginViewModel(repository) as T
                    modelClass.isAssignableFrom(CaregiverRegisterViewModel::class.java) ->
                        CaregiverRegisterViewModel(repository) as T
                    else -> throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
                }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable(CaregiverRoutes.LOGIN) {
            val vm: CaregiverLoginViewModel = viewModel(factory = factory)
            val state by vm.uiState.collectAsState()

            CaregiverLoginScreen(
                uiState = state,
                onIdentifierChange = vm::onIdentifierChange,
                onPasswordChange = vm::onPasswordChange,
                onTogglePasswordVisibility = vm::togglePasswordVisibility,
                onLoginClick = vm::submitLogin,
                onRegisterClick = { navController.navigate(CaregiverRoutes.REGISTER) },
                onLoginSuccess = {
                    navController.navigate(CaregiverRoutes.HOME) {
                        popUpTo(CaregiverRoutes.LOGIN) { inclusive = true }
                    }
                },
                onConsumeLoginSuccess = vm::consumeLoginSuccess
            )
        }

        composable(CaregiverRoutes.REGISTER) { backStackEntry ->
            val vm: CaregiverRegisterViewModel = viewModel(
                viewModelStoreOwner = backStackEntry,
                factory = factory
            )
            val state by vm.uiState.collectAsState()

            val cancelProfileToLogin = {
                vm.onCancelProfile()
                navController.navigate(CaregiverRoutes.LOGIN) {
                    popUpTo(CaregiverRoutes.REGISTER) { inclusive = true }
                }
            }

            BackHandler {
                cancelProfileToLogin()
            }

            CaregiverRegisterScreen(
                uiState = state,
                onFullNameChange = vm::onFullNameChange,
                onEmailChange = vm::onEmailChange,
                onPhoneChange = vm::onPhoneChange,
                onDateOfBirthChange = vm::onDateOfBirthChange,
                onGenderSelect = vm::onGenderSelect,
                onExperienceYearsChange = vm::onExperienceYearsChange,
                onIntroductionChange = vm::onIntroductionChange,
                onPasswordChange = vm::onPasswordChange,
                onConfirmPasswordChange = vm::onConfirmPasswordChange,
                onTogglePasswordVisibility = vm::togglePasswordVisibility,
                onToggleConfirmPasswordVisibility = vm::toggleConfirmPasswordVisibility,
                onAddCredentialClick = {
                    if (vm.onAddCredentialAction(isOnCredentialScreen = false)) {
                        navController.navigate(CaregiverRoutes.ADD_CREDENTIAL)
                    }
                },
                onRegisterClick = {
                    vm.submitRegister(isOnCredentialScreen = false)
                },
                onCancelClick = cancelProfileToLogin,
                onLoginClick = cancelProfileToLogin,
                onRegisterSuccess = {
                    navController.navigate(CaregiverRoutes.LOGIN) {
                        popUpTo(CaregiverRoutes.REGISTER) { inclusive = true }
                    }
                },
                onConsumeRegisterSuccess = vm::consumeRegisterSuccess
            )
        }

        composable(CaregiverRoutes.ADD_CREDENTIAL) { currentBackStackEntry ->
            val registerEntry = remember(navController, currentBackStackEntry) {
                navController.getBackStackEntry(CaregiverRoutes.REGISTER)
            }
            val vm: CaregiverRegisterViewModel = viewModel(
                viewModelStoreOwner = registerEntry,
                factory = factory
            )
            val state by vm.uiState.collectAsState()

            val cancelCredentialsBackToRegister: () -> Unit = {
                vm.onCancelAllCredentials()
                navController.popBackStack()
            }

            BackHandler(onBack = cancelCredentialsBackToRegister)

            CaregiverCredentialScreen(
                uiState = state,
                onTitleChange = vm::onCredentialTitleChange,
                onIssuerChange = vm::onCredentialIssuerChange,
                onYearChange = vm::onCredentialYearChange,
                onPrepareCameraUri = vm::onPrepareCameraUri,
                onCameraResult = vm::onCameraResult,
                onAddCredentialClick = {
                    vm.onAddCredentialAction(isOnCredentialScreen = true)
                },
                onRegisterClick = {
                    vm.submitRegister(isOnCredentialScreen = true)
                },
                onCancelClick = cancelCredentialsBackToRegister,
                onRegisterSuccess = {
                    navController.navigate(CaregiverRoutes.LOGIN) {
                        popUpTo(CaregiverRoutes.REGISTER) { inclusive = true }
                    }
                },
                onConsumeRegisterSuccess = vm::consumeRegisterSuccess
            )
        }

        composable(CaregiverRoutes.HOME) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text("Trang chủ người chăm sóc", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Vai trò: ${sessionManager.getRole() ?: "CAREGIVER"}")
                Spacer(modifier = Modifier.height(20.dp))
                Button(
                    onClick = {
                        sessionManager.clearSession()
                        navController.navigate(CaregiverRoutes.LOGIN) {
                            popUpTo(CaregiverRoutes.HOME) { inclusive = true }
                        }
                    }
                ) {
                    Text("Đăng xuất")
                }
            }
        }
    }
}