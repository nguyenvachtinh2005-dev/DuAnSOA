package com.soa.homecare.caregiver.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
internal fun CaregiverAuthActionBar(
    onAddCredentialClick: () -> Unit,
    onRegisterClick: () -> Unit,
    onCancelClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedButton(
                onClick = onAddCredentialClick,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Text(
                    text = "Thêm bằng",
                    fontWeight = FontWeight.SemiBold,
                    color = CaregiverTealDark
                )
            }

            OutlinedButton(
                onClick = onCancelClick,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Text(
                    text = "Huỷ",
                    fontWeight = FontWeight.SemiBold,
                    color = CaregiverTextDark
                )
            }
        }

        Button(
            onClick = onRegisterClick,
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
                text = "Đăng ký",
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}