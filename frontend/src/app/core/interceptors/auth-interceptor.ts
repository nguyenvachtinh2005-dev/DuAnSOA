import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AccountOverviewItem,
  AccountQueryFilter,
  AccountStatus,
  AccountStatusUpdateResult,
  ApiResponse,
  CareRecipientItem,
  CaregiverCertificate,
  CaregiverProfileDetail,
  CreateCareRecipientPayload,
  DocumentVerificationUpdatePayload,
  DocumentVerificationUpdateResult,
  UpdateAccountProfilePayload,
  UpdateCareRecipientPayload,
  UpdateCaregiverProfilePayload,
  UserAddressItem,
  VerificationStatus,
} from '../models';
import { assertAdminToken, getAccessToken } from '../services';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private readonly http = inject(HttpClient);

  private readonly gatewayUrl = '/api/gateway';
  private readonly authAdminUrl = `${this.gatewayUrl}/auth/admin/accounts`;
  private readonly accountAdminUrl = `${this.gatewayUrl}/accounts/admin`;
  private readonly caregiverAdminUrl = `${this.gatewayUrl}/caregivers/admin`;

  private withAdminAuth(): { ok: true; headers: HttpHeaders } | { ok: false; error: Error } {
    try {
      assertAdminToken();
      const token = getAccessToken()!;
      return {
        ok: true,
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err : new Error('Không đủ quyền ADMIN.'),
      };
    }
  }

  private unwrap<T>(res: ApiResponse<T> | T): T {
    if (res && typeof res === 'object' && 'data' in res) {
      return (res as ApiResponse<T>).data;
    }
    return res as T;
  }

  getAccounts(filter: AccountQueryFilter): Observable<AccountOverviewItem[]> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    let params = new HttpParams().set('role', filter.role);
    if (filter.search?.trim()) {
      params = params.set('search', filter.search.trim());
    }
    if (filter.status && filter.status !== 'ALL') {
      params = params.set('status', filter.status);
    }

    return this.http
      .get<ApiResponse<AccountOverviewItem[]> | AccountOverviewItem[]>(this.authAdminUrl, {
        params,
        headers: auth.headers,
      })
      .pipe(map((res) => this.unwrap(res) ?? []));
  }

  updateAccountStatus(
    accountId: number,
    accountStatus: AccountStatus
  ): Observable<AccountStatusUpdateResult> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .patch<ApiResponse<AccountStatusUpdateResult> | AccountStatusUpdateResult>(
        `${this.authAdminUrl}/${accountId}/status`,
        { account_status: accountStatus },
        { headers: auth.headers }
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  deleteAccount(accountId: number): Observable<void> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .delete<ApiResponse<void> | void>(`${this.authAdminUrl}/${accountId}`, {
        headers: auth.headers,
      })
      .pipe(map(() => void 0));
  }

  updateUserProfile(
    userId: number,
    payload: UpdateAccountProfilePayload,
    fallback?: AccountOverviewItem
  ): Observable<AccountOverviewItem> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .patch<ApiResponse<AccountOverviewItem> | AccountOverviewItem>(
        `${this.accountAdminUrl}/users/${userId}/profile`,
        payload,
        { headers: auth.headers }
      )
      .pipe(
        map((res) => {
          const data = this.unwrap(res);
          return data ?? (fallback as AccountOverviewItem);
        })
      );
  }

  updateAccountProfile(
    userId: number,
    payload: UpdateAccountProfilePayload,
    fallback?: AccountOverviewItem
  ): Observable<AccountOverviewItem> {
    return this.updateUserProfile(userId, payload, fallback);
  }

  getCustomerRecipients(customerId: number): Observable<CareRecipientItem[]> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .get<ApiResponse<CareRecipientItem[]> | CareRecipientItem[]>(
        `${this.accountAdminUrl}/customers/${customerId}/recipients`,
        { headers: auth.headers }
      )
      .pipe(map((res) => this.unwrap(res) ?? []));
  }

  addCustomerRecipient(
    customerId: number,
    payload: CreateCareRecipientPayload
  ): Observable<CareRecipientItem> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    const body: CreateCareRecipientPayload = {
      ...payload,
      customer_id: customerId,
    };

    return this.http
      .post<ApiResponse<CareRecipientItem> | CareRecipientItem>(
        `${this.accountAdminUrl}/customers/${customerId}/recipients`,
        body,
        { headers: auth.headers }
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  updateCustomerRecipient(
    customerId: number,
    recipientId: number,
    payload: UpdateCareRecipientPayload,
    fallback?: CareRecipientItem
  ): Observable<CareRecipientItem> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .patch<ApiResponse<CareRecipientItem> | CareRecipientItem>(
        `${this.accountAdminUrl}/customers/${customerId}/recipients/${recipientId}`,
        payload,
        { headers: auth.headers }
      )
      .pipe(
        map((res) => {
          const data = this.unwrap(res);
          return data ?? (fallback as CareRecipientItem);
        })
      );
  }

  deleteCustomerRecipient(customerId: number, recipientId: number): Observable<void> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .delete<ApiResponse<void> | void>(
        `${this.accountAdminUrl}/customers/${customerId}/recipients/${recipientId}`,
        { headers: auth.headers }
      )
      .pipe(map(() => void 0));
  }

  getUserAddresses(userId: number): Observable<UserAddressItem[]> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .get<ApiResponse<UserAddressItem[]> | UserAddressItem[]>(
        `${this.accountAdminUrl}/users/${userId}/addresses`,
        { headers: auth.headers }
      )
      .pipe(map((res) => this.unwrap(res) ?? []));
  }

  getCaregiverProfile(userId: number): Observable<CaregiverProfileDetail> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .get<ApiResponse<CaregiverProfileDetail> | CaregiverProfileDetail>(
        `${this.caregiverAdminUrl}/users/${userId}/profile`,
        { headers: auth.headers }
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  updateCaregiverProfile(
    caregiverId: number,
    payload: UpdateCaregiverProfilePayload
  ): Observable<CaregiverProfileDetail> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .patch<ApiResponse<CaregiverProfileDetail> | CaregiverProfileDetail>(
        `${this.caregiverAdminUrl}/${caregiverId}/profile`,
        payload,
        { headers: auth.headers }
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  getCaregiverDocuments(caregiverId: number): Observable<CaregiverCertificate[]> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    return this.http
      .get<ApiResponse<CaregiverCertificate[]> | CaregiverCertificate[]>(
        `${this.caregiverAdminUrl}/${caregiverId}/documents`,
        { headers: auth.headers }
      )
      .pipe(map((res) => this.unwrap(res) ?? []));
  }

  updateDocumentVerificationStatus(
    caregiverId: number,
    documentId: number,
    verificationStatus: VerificationStatus,
    rejectionReason?: string | null
  ): Observable<DocumentVerificationUpdateResult> {
    const auth = this.withAdminAuth();
    if (!auth.ok) return throwError(() => auth.error);

    const payload: DocumentVerificationUpdatePayload = {
      verification_status: verificationStatus,
      rejection_reason: rejectionReason ?? null,
    };

    return this.http
      .patch<ApiResponse<DocumentVerificationUpdateResult> | DocumentVerificationUpdateResult>(
        `${this.caregiverAdminUrl}/${caregiverId}/documents/${documentId}/status`,
        payload,
        { headers: auth.headers }
      )
      .pipe(map((res) => this.unwrap(res)));
  }
}