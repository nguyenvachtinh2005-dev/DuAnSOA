package com.soa.homecare.caregiver.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.soa.homecare.caregiver.core.model.CredentialUploadItem
import com.soa.homecare.caregiver.core.model.RegisterCaregiverRequest
import com.soa.homecare.caregiver.domain.repository.CaregiverAuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class CaregiverRegisterViewModel(
    private val repository: CaregiverAuthRepository
) : ViewModel() {

    private var nextCredentialId = 1L

    private val _uiState = MutableStateFlow(CaregiverRegisterUiState())
    val uiState: StateFlow<CaregiverRegisterUiState> = _uiState.asStateFlow()

    fun onFullNameChange(v: String) = _uiState.update { it.copy(fullName = v, errorMessage = null) }
    fun onEmailChange(v: String) = _uiState.update { it.copy(email = v, errorMessage = null) }
    fun onPhoneChange(v: String) = _uiState.update { it.copy(phone = v, errorMessage = null) }
    fun onDateOfBirthChange(v: String) = _uiState.update { it.copy(dateOfBirth = v, errorMessage = null) }
    fun onGenderSelect(v: GenderOption?) = _uiState.update { it.copy(gender = v, errorMessage = null) }
    fun onExperienceYearsChange(v: String) = _uiState.update {
        it.copy(experienceYears = v.filter { ch -> ch.isDigit() }, errorMessage = null)
    }
    fun onIntroductionChange(v: String) = _uiState.update { it.copy(introduction = v, errorMessage = null) }
    fun onPasswordChange(v: String) = _uiState.update { it.copy(password = v, errorMessage = null) }
    fun onConfirmPasswordChange(v: String) = _uiState.update { it.copy(confirmPassword = v, errorMessage = null) }
    fun togglePasswordVisibility() = _uiState.update { it.copy(isPasswordVisible = !it.isPasswordVisible) }
    fun toggleConfirmPasswordVisibility() = _uiState.update {
        it.copy(isConfirmPasswordVisible = !it.isConfirmPasswordVisible)
    }
    fun consumeRegisterSuccess() = _uiState.update { it.copy(isRegisterSuccess = false) }

    fun onCredentialTitleChange(v: String) = _uiState.update {
        it.copy(currentCredential = it.currentCredential.copy(title = v), errorMessage = null)
    }

    fun onCredentialIssuerChange(v: String) = _uiState.update {
        it.copy(currentCredential = it.currentCredential.copy(issuer = v), errorMessage = null)
    }

    fun onCredentialYearChange(v: String) = _uiState.update {
        val cleanYear = v.filter { ch -> ch.isDigit() }.take(4)
        it.copy(currentCredential = it.currentCredential.copy(year = cleanYear), errorMessage = null)
    }

    fun onPrepareCameraUri(uriString: String) = _uiState.update {
        it.copy(currentCredential = it.currentCredential.copy(pendingCameraUri = uriString), errorMessage = null)
    }

    fun onCameraResult(success: Boolean) {
        _uiState.update { state ->
            val pending = state.currentCredential.pendingCameraUri
            if (success && !pending.isNullOrBlank()) {
                state.copy(
                    currentCredential = state.currentCredential.copy(
                        capturedPhotoUri = pending,
                        pendingCameraUri = null
                    ),
                    errorMessage = null
                )
            } else {
                state.copy(
                    currentCredential = state.currentCredential.copy(pendingCameraUri = null),
                    errorMessage = "Chưa chụp được hình bằng cấp/chứng chỉ."
                )
            }
        }
    }

    private fun commitCurrentCredentialIfValid(): String? {
        val draft = _uiState.value.currentCredential
        val title = draft.title.trim()
        val photoUri = draft.capturedPhotoUri

        val hasAnyInput = title.isNotEmpty() ||
                draft.issuer.trim().isNotEmpty() ||
                draft.year.trim().isNotEmpty() ||
                !photoUri.isNullOrBlank()

        if (!hasAnyInput) return null

        if (title.isEmpty()) {
            return "Vui lòng nhập tên bằng cấp hoặc chứng chỉ."
        }
        if (photoUri.isNullOrBlank()) {
            return "Bắt buộc phải chụp hình bằng cấp hoặc chứng chỉ."
        }

        val added = AddedCredential(
            id = nextCredentialId++,
            title = title,
            issuer = draft.issuer.trim(),
            year = draft.year.trim(),
            photoUriString = photoUri
        )

        _uiState.update { state ->
            state.copy(
                credentials = state.credentials + added,
                currentCredential = CredentialDraft(),
                errorMessage = null
            )
        }
        return null
    }

    /**
     * Bấm "Thêm bằng":
     * - Nếu đang ở màn thêm bằng: lưu tạm bằng hiện tại vào danh sách và reset form để nhập tiếp.
     * - Nếu đang ở màn hồ sơ: reset currentCredential để mở form mới.
     */
    fun onAddCredentialAction(isOnCredentialScreen: Boolean): Boolean {
        if (!isOnCredentialScreen) {
            _uiState.update { it.copy(currentCredential = CredentialDraft(), errorMessage = null) }
            return true
        }
        val error = commitCurrentCredentialIfValid()
        if (error != null) {
            _uiState.update { it.copy(errorMessage = error) }
            return false
        }
        return true
    }

    /**
     * Bấm "Huỷ" khi đang ở màn hồ sơ:
     * Xoá toàn bộ hồ sơ đã/đang nhập rồi quay lại trang đăng nhập.
     */
    fun onCancelProfile() {
        _uiState.value = CaregiverRegisterUiState()
    }

    /**
     * Bấm "Huỷ" khi đang ở màn thêm bằng:
     * Xoá toàn bộ bằng đã và đang nhập, quay về trang đăng ký.
     */
    fun onCancelAllCredentials() {
        _uiState.update {
            it.copy(
                credentials = emptyList(),
                currentCredential = CredentialDraft(),
                errorMessage = null
            )
        }
    }

    /**
     * Bấm "Đăng ký" (ở màn hồ sơ hoặc màn thêm bằng):
     * Nếu đang ở màn thêm bằng và có nhập bằng thì lưu tạm vào danh sách, sau đó gửi tất cả lên backend.
     */
    fun submitRegister(isOnCredentialScreen: Boolean) {
        if (isOnCredentialScreen) {
            val draft = _uiState.value.currentCredential
            val hasAnyInput = draft.title.trim().isNotEmpty() ||
                    draft.issuer.trim().isNotEmpty() ||
                    draft.year.trim().isNotEmpty() ||
                    !draft.capturedPhotoUri.isNullOrBlank()

            if (hasAnyInput) {
                val error = commitCurrentCredentialIfValid()
                if (error != null) {
                    _uiState.update { it.copy(errorMessage = error) }
                    return
                }
            }
        }

        val s = _uiState.value
        val name = s.fullName.trim()
        val mail = s.email.trim()
        val exp = s.experienceYears.toIntOrNull() ?: 0

        if (name.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Vui lòng nhập họ và tên.") }
            return
        }
        if (mail.isEmpty() || !mail.contains("@")) {
            _uiState.update { it.copy(errorMessage = "Vui lòng nhập địa chỉ email hợp lệ.") }
            return
        }
        if (s.password.length < 6) {
            _uiState.update { it.copy(errorMessage = "Mật khẩu phải có ít nhất 6 ký tự.") }
            return
        }
        if (s.password != s.confirmPassword) {
            _uiState.update { it.copy(errorMessage = "Mật khẩu xác nhận không khớp.") }
            return
        }
        if (s.credentials.any { it.photoUriString.isBlank() }) {
            _uiState.update { it.copy(errorMessage = "Mỗi bằng cấp/chứng chỉ đều bắt buộc phải có hình chụp.") }
            return
        }

        val payloadCredentials = s.credentials.map { item ->
            CredentialUploadItem(
                title = item.title,
                issuer = item.issuer.ifEmpty { null },
                year = item.year.ifEmpty { null },
                photoUriString = item.photoUriString
            )
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            repository.registerCaregiver(
                RegisterCaregiverRequest(
                    fullName = name,
                    email = mail,
                    phone = s.phone.trim().ifEmpty { null },
                    dateOfBirth = s.dateOfBirth.trim().ifEmpty { null },
                    gender = s.gender?.apiValue,
                    experienceYears = exp.coerceAtLeast(0),
                    introduction = s.introduction.trim().ifEmpty { null },
                    credentials = payloadCredentials,
                    password = s.password
                )
            ).fold(
                onSuccess = {
                    _uiState.update { it.copy(isLoading = false, isRegisterSuccess = true) }
                },
                onFailure = { err ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = err.message ?: "Đăng ký thất bại."
                        )
                    }
                }
            )
        }
    }
}