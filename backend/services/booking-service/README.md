# Booking Service - SOA Homecare

- Port: 3006
- Database: `soa_homecare_db`
- Runtime: Node.js + Express + MySQL
- JWT payload tương thích Authentication Service: `userId`, `email`, `role`

## Cài đặt

```bash
npm install
```

Tạo `.env` từ `.env.example`, điền thông tin MySQL và JWT_SECRET dùng chung với Authentication Service.

```bash
npm run dev
```

## API

Tất cả API dưới `/api/bookings` yêu cầu header:

`Authorization: Bearer <access_token>`

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| POST | `/api/bookings` | CUSTOMER | Tạo booking |
| GET | `/api/bookings` | CUSTOMER, ADMIN | CUSTOMER xem của mình; ADMIN xem tất cả |
| GET | `/api/bookings/:id` | CUSTOMER, ADMIN | Chi tiết booking |
| PATCH | `/api/bookings/:id/cancel` | CUSTOMER, ADMIN | Hủy booking |
| PATCH | `/api/bookings/:id/status` | ADMIN | Chuyển trạng thái booking |

### Body tạo booking

Không gửi `customer_id`, `unit_price`, `total_amount` hoặc `duration_hours`; service tự lấy CUSTOMER từ JWT, lấy giá từ `care_services` và tự tính thời lượng/tổng tiền.

```json
{
  "recipient_id": 1,
  "address_id": 1,
  "care_service_id": 1,
  "scheduled_start": "2026-12-01 08:00:00",
  "scheduled_end": "2026-12-01 12:00:00",
  "customer_note": "Cần hỗ trợ chăm sóc buổi sáng"
}
```

### Hủy booking

`PATCH /api/bookings/:id/cancel`

```json
{
  "cancellation_reason": "Tôi có việc đột xuất"
}
```

CUSTOMER chỉ được hủy booking của mình khi trạng thái `PENDING` hoặc `CONFIRMED`. ADMIN có thể hủy booking chưa hoàn tất.

### ADMIN cập nhật trạng thái

`PATCH /api/bookings/:id/status`

```json
{
  "booking_status": "CONFIRMED",
  "note": "Đã xác nhận yêu cầu"
}
```

Các chuyển trạng thái được hỗ trợ:
- `PENDING` -> `CONFIRMED` hoặc `CANCELLED`
- `CONFIRMED` -> `IN_PROGRESS` hoặc `CANCELLED`
- `IN_PROGRESS` -> `COMPLETED`
- `COMPLETED`, `CANCELLED` là trạng thái kết thúc.

Việc phân công người chăm sóc thuộc Worker Coordination Service (port 3007), không thực hiện trong Booking Service.

## Lưu ý

Booking Service đọc các bảng `care_recipients`, `user_addresses`, `care_services` để xác thực dữ liệu tham chiếu. Việc ghi booking và lịch sử trạng thái được thực hiện trong cùng transaction. Không tự tạo dữ liệu mẫu.
