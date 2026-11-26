package com.soa.homecare.customer.navigation

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
import com.soa.homecare.customer.core.session.SessionManager
import com.soa.homecare.customer.core.ui.components.AppScreenScaffold
import com.soa.homecare.customer.domain.repository.AuthRepository
import com.soa.homecare.customer.feature.auth.LoginScreen
import com.soa.homecare.customer.feature.auth.LoginViewModel
import com.soa.homecare.customer.feature.auth.RegisterScreen
import com.soa.homecare.customer.feature.auth.RegisterViewModel

@Composable
fun AppNavHost(
    authRepository: AuthRepository,
    sessionManager: SessionManager,
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    val startDestination = remember(sessionManager) {
        if (sessionManager.getRole() != null) AppRoutes.HOME else AppRoutes.LOGIN
    }

    val authViewModelFactory = remember(authRepository) {
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return when {
                    modelClass.isAssignableFrom(LoginViewModel::class.java) ->
                        LoginViewModel(authRepository) as T
                    modelClass.isAssignableFrom(RegisterViewModel::class.java) ->
                        RegisterViewModel(authRepository) as T
                    else -> throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
                }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable(AppRoutes.LOGIN) {
            val loginViewModel: LoginViewModel = viewModel(factory = authViewModelFactory)
            val loginUiState by loginViewModel.uiState.collectAsState()

            LoginScreen(
                uiState = loginUiState,
                onIdentifierChange = loginViewModel::onIdentifierChange,
                onPasswordChange = loginViewModel::onPasswordChange,
                onTogglePasswordVisibility = loginViewModel::onTogglePasswordVisibility,
                onLoginClick = loginViewModel::onLoginClick,
                onRegisterClick = {
                    navController.navigate(AppRoutes.REGISTER)
                },
                onLoginSuccess = {
                    navController.navigate(AppRoutes.HOME) {
                        popUpTo(AppRoutes.LOGIN) { inclusive = true }
                    }
                },
                onConsumeLoginSuccess = loginViewModel::onConsumeLoginSuccess
            )
        }

        composable(AppRoutes.REGISTER) {
            val registerViewModel: RegisterViewModel = viewModel(factory = authViewModelFactory)
            val registerUiState by registerViewModel.uiState.collectAsState()

            RegisterScreen(
                uiState = registerUiState,
                onFullNameChange = registerViewModel::onFullNameChange,
                onEmailChange = registerViewModel::onEmailChange,
                onPhoneChange = registerViewModel::onPhoneChange,
                onDateOfBirthChange = registerViewModel::onDateOfBirthChange,
                onGenderSelect = registerViewModel::onGenderSelect,
                onPasswordChange = registerViewModel::onPasswordChange,
                onConfirmPasswordChange = registerViewModel::onConfirmPasswordChange,
                onTogglePasswordVisibility = registerViewModel::onTogglePasswordVisibility,
                onToggleConfirmPasswordVisibility = registerViewModel::onToggleConfirmPasswordVisibility,
                onRegisterClick = registerViewModel::onRegisterClick,
                onLoginClick = {
                    navController.popBackStack()
                },
                onRegisterSuccess = {
                    navController.navigate(AppRoutes.LOGIN) {
                        popUpTo(AppRoutes.REGISTER) { inclusive = true }
                    }
                },
                onConsumeRegisterSuccess = registerViewModel::onConsumeRegisterSuccess
            )
        }

        composable(AppRoutes.HOME) {
            AppScreenScaffold(title = "Trang chủ") {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Đăng nhập thành công!",
                        style = MaterialTheme.typography.titleLarge
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Vai trò: ${sessionManager.getRole() ?: "CUSTOMER"}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = {
                            sessionManager.clearSession()
                            navController.navigate(AppRoutes.LOGIN) {
                                popUpTo(AppRoutes.HOME) { inclusive = true }
                            }
                        }
                    ) {
                        Text(text = "Đăng xuất để test lại")
                    }
                }
            }
        }
    }
}