package com.soa.homecare.customer.feature.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.soa.homecare.customer.core.ui.components.LoadingBox
import com.soa.homecare.customer.ui.theme.CardSurface
import com.soa.homecare.customer.ui.theme.CustomerappTheme
import com.soa.homecare.customer.ui.theme.IndigoAccent
import com.soa.homecare.customer.ui.theme.InputBorder
import com.soa.homecare.customer.ui.theme.InputFill
import com.soa.homecare.customer.ui.theme.SoftMintBg
import com.soa.homecare.customer.ui.theme.SoftSkyBg
import com.soa.homecare.customer.ui.theme.TealPrimary
import com.soa.homecare.customer.ui.theme.TealPrimaryDark
import com.soa.homecare.customer.ui.theme.TextDark
import com.soa.homecare.customer.ui.theme.TextMuted

@Composable
fun LoginScreen(
    uiState: LoginUiState,
    onIdentifierChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onTogglePasswordVisibility: () -> Unit,
    onLoginClick: () -> Unit,
    onRegisterClick: () -> Unit = {},
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

    val backgroundBrush = Brush.linearGradient(
        colors = listOf(
            SoftMintBg,
            Color(0xFFF6FBF9),
            SoftSkyBg
        )
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(backgroundBrush)
            .padding(horizontal = 20.dp, vertical = 24.dp),
        contentAlignment = Alignment.Center
    ) {
        if (uiState.isLoading) {
            LoadingBox(message = "Đang đăng nhập...")
        } else {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = CardSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.8f))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(TealPrimary, IndigoAccent)
                                )
                            )
                            .padding(horizontal = 18.dp, vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "HealBooking",
                            color = Color.White,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    Text(
                        text = "Đăng nhập",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Chào mừng bạn đến với hệ thống đặt lịch khám bệnh trực tuyến",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextMuted,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Email",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = TextDark
                        )
                        OutlinedTextField(
                            value = uiState.identifier,
                            onValueChange = onIdentifierChange,
                            placeholder = {
                                Text(
                                    text = "Nhập địa chỉ email",
                                    color = TextMuted.copy(alpha = 0.75f)
                                )
                            },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = InputFill,
                                unfocusedContainerColor = InputFill,
                                focusedBorderColor = TealPrimary,
                                unfocusedBorderColor = InputBorder,
                                focusedTextColor = TextDark,
                                unfocusedTextColor = TextDark,
                                cursorColor = TealPrimary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Mật khẩu",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = TextDark
                        )
                        OutlinedTextField(
                            value = uiState.password,
                            onValueChange = onPasswordChange,
                            placeholder = {
                                Text(
                                    text = "Nhập mật khẩu",
                                    color = TextMuted.copy(alpha = 0.75f)
                                )
                            },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            visualTransformation = if (uiState.isPasswordVisible) {
                                VisualTransformation.None
                            } else {
                                PasswordVisualTransformation()
                            },
                            trailingIcon = {
                                IconButton(onClick = onTogglePasswordVisibility) {
                                    Icon(
                                        imageVector = if (uiState.isPasswordVisible) {
                                            Icons.Filled.VisibilityOff
                                        } else {
                                            Icons.Filled.Visibility
                                        },
                                        tint = TextMuted,
                                        contentDescription = if (uiState.isPasswordVisible) {
                                            "Ẩn mật khẩu"
                                        } else {
                                            "Hiện mật khẩu"
                                        }
                                    )
                                }
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = InputFill,
                                unfocusedContainerColor = InputFill,
                                focusedBorderColor = TealPrimary,
                                unfocusedBorderColor = InputBorder,
                                focusedTextColor = TextDark,
                                unfocusedTextColor = TextDark,
                                cursorColor = TealPrimary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

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
                            containerColor = TealPrimary,
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

                    val registerText = buildAnnotatedString {
                        withStyle(SpanStyle(color = TextMuted)) {
                            append("Chưa có tài khoản? ")
                        }
                        withStyle(
                            SpanStyle(
                                color = TealPrimaryDark,
                                fontWeight = FontWeight.SemiBold
                            )
                        ) {
                            append("Đăng ký tài khoản")
                        }
                    }

                    Text(
                        text = registerText,
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.clickable(onClick = onRegisterClick)
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 390, heightDp = 844)
@Composable
private fun LoginScreenPreview() {
    CustomerappTheme(dynamicColor = false) {
        LoginScreen(
            uiState = LoginUiState(),
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