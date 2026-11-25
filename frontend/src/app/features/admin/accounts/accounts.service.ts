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
        map((res) => res.data ?? { id: documentId, verification_status: verificationStatus }),
        catchError(() => of({ id: documentId, verification_status: verificationStatus }))
      );
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
}