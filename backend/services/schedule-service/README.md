# Schedule Service

- Port: `3005`
- Database: `soa_homecare_db`
- Table: `caregiver_schedules`
- Authentication: JWT dùng chung `JWT_SECRET` với Authentication Service.
- Role hỗ trợ: `CAREGIVER`, `ADMIN`.

## Cài đặt

```powershell
cd backend/services/schedule-service
npm install
Copy-Item .env.example .env
```

Cập nhật `.env` theo cấu hình MySQL và JWT_SECRET đang dùng trong các service khác, sau đó chạy:

```powershell
npm run dev
```

## API

Tất cả API `/api/schedules` yêu cầu header:

`Authorization: Bearer <access_token>`

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/health` | Công khai | Kiểm tra service |
| GET | `/api/schedules` | CAREGIVER, ADMIN | CAREGIVER xem lịch của mình; ADMIN xem tất cả |
| GET | `/api/schedules?from=2026-11-01&to=2026-11-30` | CAREGIVER, ADMIN | Lọc theo khoảng ngày |
| GET | `/api/schedules?caregiver_id=1` | ADMIN | Lọc theo ID trong `caregiver_profiles` |
| GET | `/api/schedules/:id` | CAREGIVER sở hữu lịch, ADMIN | Chi tiết lịch |
| POST | `/api/schedules` | CAREGIVER, ADMIN | Tạo lịch |
| PUT | `/api/schedules/:id` | CAREGIVER sở hữu lịch, ADMIN | Cập nhật lịch |
| DELETE | `/api/schedules/:id` | CAREGIVER sở hữu lịch, ADMIN | Xóa lịch |

### JSON tạo lịch (CAREGIVER)

```json
{
  "work_date": "2026-12-01",
  "start_time": "08:00:00",
  "end_time": "12:00:00",
  "schedule_status": "AVAILABLE",
  "note": "Ca sáng"
}
```

### JSON tạo lịch (ADMIN)

ADMIN gửi thêm `caregiver_id`, là `caregiver_profiles.id`, không phải `user_profiles.user_id`:

```json
{
  "caregiver_id": 1,
  "work_date": "2026-12-01",
  "start_time": "13:00:00",
  "end_time": "17:00:00",
  "schedule_status": "AVAILABLE",
  "note": "Ca chiều"
}
```

`work_date` dùng `YYYY-MM-DD`; thời gian dùng `HH:mm` hoặc `HH:mm:ss`. Service từ chối khung giờ kết thúc không lớn hơn giờ bắt đầu và khung giờ bị trùng của cùng người chăm sóc.

## Lưu ý

- Không commit file `.env`.
- `ALLOW_HEADER_AUTH=false` là mặc định. Chỉ bật khi cần kiểm thử nội bộ bằng `x-user-id` và `x-user-role`; khi dùng JWT thật, để `false`.
- Service tra `caregiver_profiles.id` dựa trên `user_id` trong JWT khi người chăm sóc tự quản lý lịch.
