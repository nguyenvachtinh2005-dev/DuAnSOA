# Worker Coordination Service

Service quản lý phân công người chăm sóc cho booking.

## Công nghệ
- Node.js
- Express.js
- MySQL
- JWT

## Port
3007

## Cài đặt
```bash
npm install
```

## Chạy development
```bash
npm run dev
```

## Chạy production
```bash
npm start
```

## API
- GET `/health`
- GET `/api/assignments`
- GET `/api/assignments/:id`
- POST `/api/assignments`
- PATCH `/api/assignments/:id/accept`
- PATCH `/api/assignments/:id/reject`
- PATCH `/api/assignments/:id/cancel`

## Quyền truy cập

ADMIN:
- Xem danh sách phân công
- Tạo phân công
- Xem chi tiết
- Hủy phân công

CAREGIVER:
- Xem phân công của mình
- Xem chi tiết phân công của mình
- Chấp nhận phân công
- Từ chối phân công

Lưu ý: `.env` không được đưa lên GitHub. Sao chép `.env.example` thành `.env` và điền thông tin kết nối database cùng JWT secret đang dùng chung với các service khác.
