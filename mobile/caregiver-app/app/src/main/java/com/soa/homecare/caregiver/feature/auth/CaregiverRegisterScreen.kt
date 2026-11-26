package com.soa.homecare.caregiver.feature.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun CaregiverRegisterScreen(
    uiState: CaregiverRegisterUiState,
    onFullNameChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onPhoneChange: (String) -> Unit,
    onDateOfBirthChange: (String) -> Unit,
    onGenderSelect: (GenderOption?) -> Unit,
    onExperienceYearsChange: (String) -> Unit,
    onIntroductionChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onConfirmPasswordChange: (String) -> Unit,
    onTogglePasswordVisibility: () -> Unit,
    onToggleConfirmPasswordVisibility: () -> Unit,
    onAddCredentialClick: () -> Unit,
    onRegisterClick: () -> Unit,
    onCancelClick: () -> Unit,
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

    CaregiverAuthBackground {
        if (uiState.isLoading) {
            CircularProgressIndicator(color = CaregiverTeal)
        } else {
            CaregiverAuthCard(modifier = modifier) {
                CaregiverBrandHeader(
                    title = "Đăng ký người chăm sóc",
                    subtitle = "Tạo tài khoản và bổ sung hồ sơ chuyên môn"
                )
                Spacer(modifier = Modifier.height(20.dp))

                CaregiverInputField(
                    label = "Họ và tên",
                    value = uiState.fullName,
                    placeholder = "Nhập họ và tên đầy đủ",
                    onValueChange = onFullNameChange
                )
                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Email",
                    value = uiState.email,
                    placeholder = "Nhập địa chỉ email",
                    onValueChange = onEmailChange
                )
                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Số điện thoại",
                    value = uiState.phone,
                    placeholder = "Nhập số điện thoại",
                    onValueChange = onPhoneChange
                )
                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Ngày sinh",
                    value = uiState.dateOfBirth,
                    placeholder = "YYYY-MM-DD (VD: 1995-08-20)",
                    onValueChange = onDateOfBirthChange
                )
                Spacer(modifier = Modifier.height(12.dp))

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "Giới tính",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = CaregiverTextDark
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        GenderOption.entries.forEach { option ->
                            val selected = uiState.gender == option
                            FilterChip(
                                selected = selected,
                                onClick = { onGenderSelect(if (selected) null else option) },
                                label = { Text(option.label) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = CaregiverTeal.copy(alpha = 0.14f),
                                    selectedLabelColor = CaregiverTealDark,
                                    containerColor = CaregiverInputFill,
                                    labelColor = CaregiverTextDark
                                )
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Số năm kinh nghiệm",
                    value = uiState.experienceYears,
                    placeholder = "0",
                    onValueChange = onExperienceYearsChange
                )
                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Giới thiệu ngắn",
                    value = uiState.introduction,
                    placeholder = "Mô tả kinh nghiệm chăm sóc...",
                    onValueChange = onIntroductionChange,
                    singleLine = false,
                    minLines = 2
                )
                Spacer(modifier = Modifier.height(14.dp))

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Bằng cấp / Chứng chỉ đã thêm (không bắt buộc)",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = CaregiverTextDark
                    )

                    if (uiState.credentials.isEmpty()) {
                        Text(
                            text = "Chưa có bằng cấp/chứng chỉ nào. Bấm \"Thêm bằng\" để chụp và lưu tạm.",
                            style = MaterialTheme.typography.bodySmall,
                            color = CaregiverTextMuted
                        )
                    } else {
                        uiState.credentials.forEachIndexed { index, item ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = CaregiverInputFill),
                                border = BorderStroke(1.dp, CaregiverInputBorder)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "#${index + 1}. ${item.title}",
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = FontWeight.SemiBold,
                                            color = CaregiverTextDark
                                        )
                                        Text(
                                            text = "Đã chụp ảnh • Chờ gửi khi bấm Đăng ký",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = CaregiverTealDark
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Mật khẩu",
                    value = uiState.password,
                    placeholder = "Nhập mật khẩu (tối thiểu 6 ký tự)",
                    onValueChange = onPasswordChange,
                    isPassword = true,
                    isPasswordVisible = uiState.isPasswordVisible,
                    onTogglePassword = onTogglePasswordVisibility
                )
                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Xác nhận mật khẩu",
                    value = uiState.confirmPassword,
                    placeholder = "Nhập lại mật khẩu",
                    onValueChange = onConfirmPasswordChange,
                    isPassword = true,
                    isPasswordVisible = uiState.isConfirmPasswordVisible,
                    onTogglePassword = onToggleConfirmPasswordVisibility
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

                CaregiverAuthActionBar(
                    onAddCredentialClick = onAddCredentialClick,
                    onRegisterClick = onRegisterClick,
                    onCancelClick = onCancelClick
                )

                Spacer(modifier = Modifier.height(18.dp))

                val loginPrompt = buildAnnotatedString {
                    withStyle(SpanStyle(color = CaregiverTextMuted)) {
                        append("Đã có tài khoản? ")
                    }
                    withStyle(
                        SpanStyle(
                            color = CaregiverTealDark,
                            fontWeight = FontWeight.SemiBold
                        )
                    ) {
                        append("Đăng nhập")
                    }
                }

                Text(
                    text = loginPrompt,
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.clickable(onClick = onLoginClick)
                )
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 390, heightDp = 844)
@Composable
private fun CaregiverRegisterScreenPreview() {
    MaterialTheme {
        CaregiverRegisterScreen(
            uiState = CaregiverRegisterUiState(),
            onFullNameChange = {},
            onEmailChange = {},
            onPhoneChange = {},
            onDateOfBirthChange = {},
            onGenderSelect = {},
            onExperienceYearsChange = {},
            onIntroductionChange = {},
            onPasswordChange = {},
            onConfirmPasswordChange = {},
            onTogglePasswordVisibility = {},
            onToggleConfirmPasswordVisibility = {},
            onAddCredentialClick = {},
            onRegisterClick = {},
            onCancelClick = {},
            onLoginClick = {},
            onRegisterSuccess = {},
            onConsumeRegisterSuccess = {}
        )
    }
}