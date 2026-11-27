import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AccountOverviewItem,
  AccountStatus,
  CaregiverCertificate,
  CaregiverProfileDetail,
  Gender,
  UpdateAccountProfilePayload,
  UpdateCaregiverProfilePayload,
  VerificationStatus,
} from '../../../../core/models';
import { AccountsService } from '../../../../core/services/accounts.service/accounts.service';

@Component({
  selector: 'app-caregiver-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caregiver-accounts.html',
  styleUrl: './caregiver-accounts.scss',
})
export class CaregiverAccounts {
  private readonly accountsService = inject(AccountsService);

  readonly caregiver = input<AccountOverviewItem | null>(null);
  readonly closed = output<void>();
  readonly accountUpdated = output<AccountOverviewItem>();
  readonly accountRemoved = output<number>();
  readonly pendingChanged = output<{ caregiverId: number; hasPending: boolean }>();

  readonly profileDetail = signal<CaregiverProfileDetail | null>(null);
  readonly documents = signal<CaregiverCertificate[]>([]);
  readonly loadingDetail = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly editFullName = signal('');
  readonly editPhone = signal('');
  readonly editDateOfBirth = signal('');
  readonly editGender = signal<Gender | ''>('');
  readonly editAvatarUrl = signal('');

  readonly editIntroduction = signal('');
  readonly editQualification = signal('');
  readonly editLicenseNumber = signal('');
  readonly editExperienceYears = signal(0);
  readonly editVerificationStatus = signal<VerificationStatus>('PENDING');
  readonly editRejectionReason = signal('');

  constructor() {
    effect(() => {
      const current = this.caregiver();
      this.errorMessage.set(null);
      this.profileDetail.set(null);

      if (!current) {
        this.documents.set([]);
        return;
      }

      this.editFullName.set(current.full_name ?? '');
      this.editPhone.set(current.phone ?? '');
      this.editDateOfBirth.set(current.date_of_birth ? current.date_of_birth.slice(0, 10) : '');
      this.editGender.set(current.gender ?? '');
      this.editAvatarUrl.set(current.avatar_url ?? '');

      this.editIntroduction.set('');
      this.editQualification.set(current.qualification ?? '');
      this.editLicenseNumber.set(current.license_number ?? '');
      this.editExperienceYears.set(current.experience_years ?? 0);
      this.editVerificationStatus.set(current.verification_status ?? 'PENDING');
      this.editRejectionReason.set('');

      this.loadingDetail.set(true);

      this.accountsService
        .getCaregiverProfile(current.id)
        .pipe(catchError(() => of(null)))
        .subscribe((detail) => {
          if (detail) {
            this.profileDetail.set(detail);
            this.editIntroduction.set(detail.introduction ?? '');
            this.editQualification.set(detail.qualification ?? current.qualification ?? '');
            this.editLicenseNumber.set(detail.license_number ?? current.license_number ?? '');
            this.editExperienceYears.set(detail.experience_years ?? current.experience_years ?? 0);
            this.editVerificationStatus.set(
              detail.verification_status ?? current.verification_status ?? 'PENDING'
            );
            this.editRejectionReason.set(detail.rejection_reason ?? '');
          }
        });

      const targetCaregiverId = this.profileDetail()?.id ?? current.id;
      this.accountsService.getCaregiverDocuments(targetCaregiverId).subscribe({
        next: (docs) => {
          this.documents.set(docs);
          this.loadingDetail.set(false);
          this.pendingChanged.emit({
            caregiverId: current.id,
            hasPending: docs.some((d) => d.verification_status !== 'APPROVED'),
          });
        },
        error: (err: unknown) => {
          this.documents.set([]);
          this.loadingDetail.set(false);
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Không thể tải danh sách giấy tờ nhân viên.'
          );
        },
      });
    });
  }

  close(): void {
    this.errorMessage.set(null);
    this.closed.emit();
  }

  saveProfile(item: AccountOverviewItem): void {
    this.errorMessage.set(null);

    const userId = this.profileDetail()?.user_id ?? item.id;
    const caregiverId = this.profileDetail()?.id ?? item.id;

    const userPayload: UpdateAccountProfilePayload = {
      full_name: this.editFullName().trim(),
      phone: this.editPhone().trim() || null,
      date_of_birth: this.editDateOfBirth().trim() || null,
      gender: this.editGender() || null,
      avatar_url: this.editAvatarUrl().trim() || null,
    };

    const caregiverPayload: UpdateCaregiverProfilePayload = {
      introduction: this.editIntroduction().trim() || null,
      qualification: this.editQualification().trim() || null,
      license_number: this.editLicenseNumber().trim() || null,
      experience_years: Math.max(0, Number(this.editExperienceYears()) || 0),
      verification_status: this.editVerificationStatus(),
      rejection_reason: this.editRejectionReason().trim() || null,
    };

    forkJoin({
      updatedUser: this.accountsService
        .updateUserProfile(userId, userPayload)
        .pipe(catchError(() => of(null))),
      updatedCaregiver: this.accountsService.updateCaregiverProfile(caregiverId, caregiverPayload),
    }).subscribe({
      next: ({ updatedUser, updatedCaregiver }) => {
        if (updatedCaregiver) {
          this.profileDetail.set(updatedCaregiver);
        }

        const merged: AccountOverviewItem = {
          ...item,
          ...userPayload,
          ...(updatedUser ?? {}),
          id: item.id,
          email: item.email,
          qualification: updatedCaregiver?.qualification ?? caregiverPayload.qualification ?? null,
          license_number:
            updatedCaregiver?.license_number ?? caregiverPayload.license_number ?? null,
          experience_years:
            updatedCaregiver?.experience_years ?? caregiverPayload.experience_years ?? 0,
          verification_status:
            updatedCaregiver?.verification_status ?? caregiverPayload.verification_status ?? null,
        };

        this.accountUpdated.emit(merged);
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          err instanceof Error ? err.message : 'Cập nhật hồ sơ nhân viên chăm sóc thất bại.'
        );
      },
    });
  }

  changeStatus(item: AccountOverviewItem, nextStatus: AccountStatus): void {
    this.errorMessage.set(null);

    if (nextStatus === 'LOCKED' && !window.confirm(`Xác nhận khoá tài khoản "${item.full_name}"?`)) {
      return;
    }

    this.accountsService.updateAccountStatus(item.id, nextStatus).subscribe({
      next: (res) => {
        this.accountUpdated.emit({ ...item, account_status: res.account_status });
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          err instanceof Error ? err.message : 'Cập nhật trạng thái tài khoản thất bại.'
        );
      },
    });
  }

  cancelAccount(item: AccountOverviewItem): void {
    this.errorMessage.set(null);

    if (!window.confirm(`Xác nhận huỷ tài khoản "${item.full_name}"?`)) {
      return;
    }

    this.accountsService.deleteAccount(item.id).subscribe({
      next: () => {
        this.accountRemoved.emit(item.id);
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          err instanceof Error ? err.message : 'Huỷ tài khoản thất bại.'
        );
      },
    });
  }

  approveDoc(item: AccountOverviewItem, doc: CaregiverCertificate): void {
    if (doc.verification_status !== 'PENDING') {
      return;
    }
    this.errorMessage.set(null);

    if (!window.confirm(`Xác nhận duyệt chứng chỉ "${doc.document_name}" của ${item.full_name}?`)) {
      return;
    }

    const caregiverId = this.profileDetail()?.id ?? doc.caregiver_id ?? item.id;
    this.accountsService
      .updateDocumentVerificationStatus(caregiverId, doc.id, 'APPROVED', null)
      .subscribe({
        next: (res) => {
          const nextDocs = this.documents().map((d) =>
            d.id === doc.id
              ? { ...d, verification_status: res.verification_status, rejection_reason: null }
              : d
          );
          this.documents.set(nextDocs);
          this.pendingChanged.emit({
            caregiverId: item.id,
            hasPending: nextDocs.some((d) => d.verification_status === 'PENDING'),
          });
        },
        error: (err: unknown) => {
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Duyệt giấy tờ thất bại.'
          );
        },
      });
  }

  rejectDoc(item: AccountOverviewItem, doc: CaregiverCertificate): void {
    if (doc.verification_status === 'APPROVED' || doc.verification_status === 'REJECTED') {
      return;
    }
    this.errorMessage.set(null);

    const reason = window.prompt(
      `Nhập lý do từ chối chứng chỉ "${doc.document_name}" của ${item.full_name}:`,
      doc.rejection_reason ?? ''
    );
    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim() || 'Không đạt yêu cầu xác minh';
    const caregiverId = this.profileDetail()?.id ?? doc.caregiver_id ?? item.id;

    this.accountsService
      .updateDocumentVerificationStatus(caregiverId, doc.id, 'REJECTED', trimmedReason)
      .subscribe({
        next: (res) => {
          const nextDocs = this.documents().map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  verification_status: res.verification_status,
                  rejection_reason: trimmedReason,
                }
              : d
          );
          this.documents.set(nextDocs);
          this.pendingChanged.emit({
            caregiverId: item.id,
            hasPending: nextDocs.some((d) => d.verification_status === 'PENDING'),
          });
        },
        error: (err: unknown) => {
          this.errorMessage.set(
            err instanceof Error ? err.message : 'Từ chối giấy tờ thất bại.'
          );
        },
      });
  }
}