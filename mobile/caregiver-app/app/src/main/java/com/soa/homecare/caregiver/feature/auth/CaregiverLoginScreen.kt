package com.soa.homecare.caregiver.feature.auth

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun CaregiverLoginScreen(
    uiState: CaregiverLoginUiState,
    onIdentifierChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onTogglePasswordVisibility: () -> Unit,
    onLoginClick: () -> Unit,
    onRegisterClick: () -> Unit,
    onLoginSuccess: () -> Unit,
    onConsumeLoginSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    LaunchedEffect(uiState.isLoginSuccess) {
        if (uiState.isLoginSuccess) {
            onConsumeLoginSuccess()
            onLoginSuccess()
        }
    }

    CaregiverAuthBackground {
        if (uiState.isLoading) {
            CircularProgressIndicator(color = CaregiverTeal)
        } else {
            CaregiverAuthCard(modifier = modifier) {
                CaregiverBrandHeader(
                    title = "Đăng nhập",
                    subtitle = "Cổng dành cho nhân viên / người chăm sóc sức khỏe"
                )
                Spacer(modifier = Modifier.height(22.dp))

                CaregiverInputField(
                    label = "Email",
                    value = uiState.identifier,
                    placeholder = "Nhập địa chỉ email",
                    onValueChange = onIdentifierChange
                )
                Spacer(modifier = Modifier.height(14.dp))

                CaregiverInputField(
                    label = "Mật khẩu",
                    value = uiState.password,
                    placeholder = "Nhập mật khẩu",
                    onValueChange = onPasswordChange,
                    isPassword = true,
                    isPasswordVisible = uiState.isPasswordVisible,
                    onTogglePassword = onTogglePasswordVisibility
                )

                if (uiState.errorMessage != null) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = uiState.errorMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Spacer(modifier = Modifier.height(22.dp))

                Button(
                    onClick = onLoginClick,
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(vertical = 13.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = CaregiverTeal,
                        contentColor = Color.White
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                ) {
                    Text(
                        text = "Đăng nhập",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                val registerPrompt = buildAnnotatedString {
                    withStyle(SpanStyle(color = CaregiverTextMuted)) {
                        append("Chưa có tài khoản cộng tác? ")
                    }
                    withStyle(
                        SpanStyle(
                            color = CaregiverTealDark,
                            fontWeight = FontWeight.SemiBold
                        )
                    ) {
                        append("Đăng ký ngay")
                    }
                }

                Text(
                    text = registerPrompt,
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.clickable(onClick = onRegisterClick)
                )
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 390, heightDp = 844)
@Composable
private fun CaregiverLoginScreenPreview() {
    MaterialTheme {
        CaregiverLoginScreen(
            uiState = CaregiverLoginUiState(),
            onIdentifierChange = {},
            onPasswordChange = {},
            onTogglePasswordVisibility = {},
            onLoginClick = {},
            onRegisterClick = {},
            onLoginSuccess = {},
            onConsumeLoginSuccess = {}
        )
    }
}