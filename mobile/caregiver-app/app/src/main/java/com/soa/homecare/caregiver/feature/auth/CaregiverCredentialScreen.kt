package com.soa.homecare.caregiver.feature.auth

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import java.io.File

private fun createCredentialImageUri(context: Context): Uri {
    val imagesDir = File(context.cacheDir, "credential_photos").apply { mkdirs() }
    val file = File(imagesDir, "cred_${System.currentTimeMillis()}.jpg")
    return FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        file
    )
}

@Composable
fun CaregiverCredentialScreen(
    uiState: CaregiverRegisterUiState,
    onTitleChange: (String) -> Unit,
    onIssuerChange: (String) -> Unit,
    onYearChange: (String) -> Unit,
    onPrepareCameraUri: (String) -> Unit,
    onCameraResult: (Boolean) -> Unit,
    onAddCredentialClick: () -> Unit,
    onRegisterClick: () -> Unit,
    onCancelClick: () -> Unit,
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

    val context = LocalContext.current
    val draft = uiState.currentCredential

    val takePictureLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { isSuccess ->
        onCameraResult(isSuccess)
    }

    fun launchCameraCapture() {
        val uri = createCredentialImageUri(context)
        onPrepareCameraUri(uri.toString())
        takePictureLauncher.launch(uri)
    }

    CaregiverAuthBackground {
        if (uiState.isLoading) {
            CircularProgressIndicator(color = CaregiverTeal)
        } else {
            CaregiverAuthCard(modifier = modifier) {
                CaregiverBrandHeader(
                    title = "Thêm bằng cấp / Chứng chỉ",
                    subtitle = "Bắt buộc chụp ảnh rõ nét. Ảnh và hồ sơ sẽ gửi lên hệ thống khi bấm Đăng ký."
                )
                Spacer(modifier = Modifier.height(20.dp))

                CaregiverInputField(
                    label = "Tên bằng cấp / chứng chỉ",
                    value = draft.title,
                    placeholder = "VD: Cử nhân Điều dưỡng, Chứng chỉ Sơ cấp cứu",
                    onValueChange = onTitleChange
                )
                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Nơi cấp / Số hiệu (tùy chọn)",
                    value = draft.issuer,
                    placeholder = "VD: Đại học Y Dược / Số hiệu",
                    onValueChange = onIssuerChange
                )
                Spacer(modifier = Modifier.height(12.dp))

                CaregiverInputField(
                    label = "Năm cấp (tùy chọn)",
                    value = draft.year,
                    placeholder = "VD: 2024",
                    onValueChange = onYearChange
                )
                Spacer(modifier = Modifier.height(14.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = CaregiverInputFill),
                    border = BorderStroke(1.dp, CaregiverInputBorder)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Ảnh chụp bằng cấp / chứng chỉ (Bắt buộc)",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = CaregiverTextDark
                        )

                        if (draft.capturedPhotoUri != null) {
                            Text(
                                text = "Đã chụp ảnh thành công (chờ gửi khi bấm Đăng ký)",
                                style = MaterialTheme.typography.bodySmall,
                                color = CaregiverTealDark,
                                fontWeight = FontWeight.Medium
                            )
                        } else {
                            Text(
                                text = "Chưa có ảnh chụp",
                                style = MaterialTheme.typography.bodySmall,
                                color = CaregiverTextMuted
                            )
                        }

                        OutlinedButton(
                            onClick = { launchCameraCapture() },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = if (draft.capturedPhotoUri == null) {
                                    "Chụp hình bằng cấp / chứng chỉ"
                                } else {
                                    "Chụp lại hình"
                                }
                            )
                        }
                    }
                }

                if (uiState.credentials.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Đã lưu tạm ${uiState.credentials.size} bằng cấp/chứng chỉ",
                        style = MaterialTheme.typography.bodySmall,
                        color = CaregiverTealDark,
                        fontWeight = FontWeight.Medium,
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

                Spacer(modifier = Modifier.height(20.dp))

                CaregiverAuthActionBar(
                    onAddCredentialClick = onAddCredentialClick,
                    onRegisterClick = onRegisterClick,
                    onCancelClick = onCancelClick
                )
            }
        }
    }
}