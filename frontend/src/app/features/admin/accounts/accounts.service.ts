import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
  AccountOverviewItem,
  AccountQueryFilter,
  AccountStatus,
  AccountStatusUpdateResult,
  VerificationStatus,
} from '../../../core/models/account-management.model';
import {
  CaregiverCertificate,
  DocumentVerificationUpdatePayload,
  DocumentVerificationUpdateResult,
} from '../../../core/models/caregiver-document.model';
import { ApiResponse } from '../../../core/models/api.model';
import { MOCK_ACCOUNTS, MOCK_CAREGIVER_CERTIFICATES } from './accounts.mock';
import { CareRecipientItem } from '../../../core/models/account-management.model';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/accounts';
  private readonly caregiverBaseUrl = '/api/admin/caregivers';

  getAccounts(filter: AccountQueryFilter): Observable<AccountOverviewItem[]> {
    let params = new HttpParams().set('role', filter.role);
    if (filter.search?.trim()) {
      params = params.set('search', filter.search.trim());
    }
    if (filter.status && filter.status !== 'ALL') {
      params = params.set('status', filter.status);
    }

    return this.http
      .get<ApiResponse<AccountOverviewItem[]> | AccountOverviewItem[]>(this.baseUrl, { params })
      .pipe(
        map((res) => (Array.isArray(res) ? res : res.data ?? [])),
        catchError(() => of(this.filterLocalFallback(filter)))
      );
  }

  updateAccountStatus(
    accountId: number,
    nextStatus: AccountStatus
  ): Observable<AccountStatusUpdateResult> {
    return this.http
      .patch<ApiResponse<AccountStatusUpdateResult>>(`${this.baseUrl}/${accountId}/status`, {
        account_status: nextStatus,
      })
      .pipe(
        map((res) => res.data ?? { id: accountId, account_status: nextStatus }),
        catchError(() => of({ id: accountId, account_status: nextStatus }))
      );
  }

  getCaregiverDocuments(caregiverId: number): Observable<CaregiverCertificate[]> {
    return this.http
      .get<ApiResponse<CaregiverCertificate[]> | CaregiverCertificate[]>(
        `${this.caregiverBaseUrl}/${caregiverId}/documents`
      )
      .pipe(
        map((res) => (Array.isArray(res) ? res : res.data ?? [])),
        catchError(() =>
          of(MOCK_CAREGIVER_CERTIFICATES.filter((doc) => doc.caregiver_id === caregiverId))
        )
      );
  }

  updateDocumentVerificationStatus(
    caregiverId: number,
    documentId: number,
    verificationStatus: VerificationStatus,
    rejectionReason?: string | null
  ): Observable<DocumentVerificationUpdateResult> {
    const payload: DocumentVerificationUpdatePayload = {
      verification_status: verificationStatus,
      rejection_reason: rejectionReason ?? null,
    };

    return this.http
      .patch<ApiResponse<DocumentVerificationUpdateResult>>(
        `${this.caregiverBaseUrl}/${caregiverId}/documents/${documentId}/status`,
        payload
      )
      .pipe(
        map((res) => {
          const result = res.data ?? { id: documentId, verification_status: verificationStatus };
          this.syncMockCertificateStatus(caregiverId, documentId, result.verification_status);
          return result;
        }),
        catchError(() => {
          this.syncMockCertificateStatus(caregiverId, documentId, verificationStatus);
          return of({ id: documentId, verification_status: verificationStatus });
        })
      );
  }

  private syncMockCertificateStatus(
    caregiverId: number,
    documentId: number,
    status: VerificationStatus
  ): void {
    const target = MOCK_CAREGIVER_CERTIFICATES.find(
      (doc) => doc.caregiver_id === caregiverId && doc.id === documentId
    );
    if (target) {
      target.verification_status = status;
    }
  }

  private filterLocalFallback(filter: AccountQueryFilter): AccountOverviewItem[] {
    const keyword = (filter.search ?? '').trim().toLowerCase();
    return MOCK_ACCOUNTS.filter((item) => {
      const matchRole = item.role === filter.role;
      const matchStatus =
        !filter.status || filter.status === 'ALL' || item.account_status === filter.status;
      const matchKeyword =
        !keyword ||
        item.full_name.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        (item.phone ?? '').toLowerCase().includes(keyword);
      return matchRole && matchStatus && matchKeyword;
    });
  }

  deleteAccount(accountId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${accountId}`).pipe(
      catchError(() => of(void 0))
    );
  }

  getCustomerRecipients(customerId: number): Observable<CareRecipientItem[]> {
    const fallback: CareRecipientItem[] =
      customerId === 101
        ? [
            {
              id: 1,
              customer_id: 101,
              full_name: 'Trần Văn An',
              relationship: 'Cha',
              date_of_birth: '1950-04-12',
              gender: 'MALE',
              medical_notes: 'Tăng huyết áp nhẹ, cần kiểm tra định kỳ',
              emergency_contact_name: 'Trần Văn Minh',
              emergency_contact_phone: '0905123456',
            },
            {
              id: 2,
              customer_id: 101,
              full_name: 'Nguyễn Thị Hoa',
              relationship: 'Mẹ',
              date_of_birth: '1954-09-21',
              gender: 'FEMALE',
              medical_notes: 'Đau khớp gối',
              emergency_contact_name: 'Trần Văn Minh',
              emergency_contact_phone: '0905123456',
            },
          ]
        : [];

    return this.http
      .get<ApiResponse<CareRecipientItem[]> | CareRecipientItem[]>(
        `${this.baseUrl}/${customerId}/recipients`
      )
      .pipe(
        map((res) => (Array.isArray(res) ? res : res.data ?? [])),
        catchError(() => of(fallback))
      );
  }
}