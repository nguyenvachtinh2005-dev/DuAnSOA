package com.soa.homecare.customer.feature.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
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
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
fun RegisterScreen(
    uiState: RegisterUiState,
    onFullNameChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onPhoneChange: (String) -> Unit,
    onDateOfBirthChange: (String) -> Unit,
    onGenderSelect: (GenderOption?) -> Unit,
    onPasswordChange: (String) -> Unit,
    onConfirmPasswordChange: (String) -> Unit,
    onTogglePasswordVisibility: () -> Unit,
    onToggleConfirmPasswordVisibility: () -> Unit,
    onRegisterClick: () -> Unit,
    onLoginClick: () -> Unit,
    onRegisterSuccess: () -> Unit,
    onConsumeRegisterSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    LaunchedEffect(uiState.isRegisterSuccess) {
        if (uiState.isRegisterSuccess) {
            onConsumeRegisterSuccess()
            onRegisterSuccess()
        }
    }

    val backgroundBrush = Brush.linearGradient(
        colors = listOf(
            SoftMintBg,
            Color(0xFFF6FBF9),
            SoftSkyBg
        )
    )

    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedContainerColor = InputFill,
        unfocusedContainerColor = InputFill,
        focusedBorderColor = TealPrimary,
        unfocusedBorderColor = InputBorder,
        focusedTextColor = TextDark,
        unfocusedTextColor = TextDark,
        cursorColor = TealPrimary
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(backgroundBrush)
            .padding(horizontal = 20.dp, vertical = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        if (uiState.isLoading) {
            LoadingBox(message = "Đang tạo tài khoản...")
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
                        .padding(horizontal = 24.dp, vertical = 28.dp),
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

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Đăng ký tài khoản",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Tạo tài khoản khách hàng để đặt lịch chăm sóc sức khỏe",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextMuted,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(22.dp))

                    LabeledField(
                        label = "Họ và tên",
                        value = uiState.fullName,
                        placeholder = "Nhập họ và tên đầy đủ",
                        onValueChange = onFullNameChange,
                        fieldColors = fieldColors
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    LabeledField(
                        label = "Email",
                        value = uiState.email,
                        placeholder = "Nhập địa chỉ email",
                        onValueChange = onEmailChange,
                        fieldColors = fieldColors
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    LabeledField(
                        label = "Số điện thoại",
                        value = uiState.phone,
                        placeholder = "Nhập số điện thoại",
                        onValueChange = onPhoneChange,
                        fieldColors = fieldColors
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    LabeledField(
                        label = "Ngày sinh",
                        value = uiState.dateOfBirth,
                        placeholder = "YYYY-MM-DD (VD: 1998-06-15)",
                        onValueChange = onDateOfBirthChange,
                        fieldColors = fieldColors
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Giới tính",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = TextDark
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            GenderOption.entries.forEach { option ->
                                val selected = uiState.gender == option
                                FilterChip(
                                    selected = selected,
                                    onClick = {
                                        onGenderSelect(if (selected) null else option)
                                    },
                                    label = { Text(option.label) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = TealPrimary.copy(alpha = 0.14f),
                                        selectedLabelColor = TealPrimaryDark,
                                        containerColor = InputFill,
                                        labelColor = TextDark
                                    )
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    PasswordField(
                        label = "Mật khẩu",
                        value = uiState.password,
                        placeholder = "Nhập mật khẩu (tối thiểu 6 ký tự)",
                        isVisible = uiState.isPasswordVisible,
                        onValueChange = onPasswordChange,
                        onToggleVisibility = onTogglePasswordVisibility,
                        fieldColors = fieldColors
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    PasswordField(
                        label = "Xác nhận mật khẩu",
                        value = uiState.confirmPassword,
                        placeholder = "Nhập lại mật khẩu",
                        isVisible = uiState.isConfirmPasswordVisible,
                        onValueChange = onConfirmPasswordChange,
                        onToggleVisibility = onToggleConfirmPasswordVisibility,
                        fieldColors = fieldColors
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
                        onClick = onRegisterClick,
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
                            text = "Đăng ký",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    val loginText = buildAnnotatedString {
                        withStyle(SpanStyle(color = TextMuted)) {
                            append("Đã có tài khoản? ")
                        }
                        withStyle(
                            SpanStyle(
                                color = TealPrimaryDark,
                                fontWeight = FontWeight.SemiBold
                            )
                        ) {
                            append("Đăng nhập")
                        }
                    }

                    Text(
                        text = loginText,
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.clickable(onClick = onLoginClick)
                    )
                }
            }
        }
    }
}

@Composable
private fun LabeledField(
    label: String,
    value: String,
    placeholder: String,
    onValueChange: (String) -> Unit,
    fieldColors: androidx.compose.material3.TextFieldColors
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            color = TextDark
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = {
                Text(
                    text = placeholder,
                    color = TextMuted.copy(alpha = 0.75f)
                )
            },
            singleLine = true,
            shape = RoundedCornerShape(10.dp),
            colors = fieldColors,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun PasswordField(
    label: String,
    value: String,
    placeholder: String,
    isVisible: Boolean,
    onValueChange: (String) -> Unit,
    onToggleVisibility: () -> Unit,
    fieldColors: androidx.compose.material3.TextFieldColors
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            color = TextDark
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = {
                Text(
                    text = placeholder,
                    color = TextMuted.copy(alpha = 0.75f)
                )
            },
            singleLine = true,
            shape = RoundedCornerShape(10.dp),
            visualTransformation = if (isVisible) {
                VisualTransformation.None
            } else {
                PasswordVisualTransformation()
            },
            trailingIcon = {
                IconButton(onClick = onToggleVisibility) {
                    Icon(
                        imageVector = if (isVisible) {
                            Icons.Filled.VisibilityOff
                        } else {
                            Icons.Filled.Visibility
                        },
                        tint = TextMuted,
                        contentDescription = if (isVisible) "Ẩn mật khẩu" else "Hiện mật khẩu"
                    )
                }
            },
            colors = fieldColors,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Preview(showBackground = true, widthDp = 390, heightDp = 960)
@Composable
private fun RegisterScreenPreview() {
    CustomerappTheme(dynamicColor = false) {
        RegisterScreen(
            uiState = RegisterUiState(),
            onFullNameChange = {},
            onEmailChange = {},
            onPhoneChange = {},
            onDateOfBirthChange = {},
            onGenderSelect = {},
            onPasswordChange = {},
            onConfirmPasswordChange = {},
            onTogglePasswordVisibility = {},
            onToggleConfirmPasswordVisibility = {},
            onRegisterClick = {},
            onLoginClick = {},
            onRegisterSuccess = {},
            onConsumeRegisterSuccess = {}
        )
    }
}