
CREATE DATABASE IF NOT EXISTS soa_homecare_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE soa_homecare_db;

-- 1. AUTHENTICATION SERVICE (PORT 3001)
-- Quản lý tài khoản đăng nhập và phân quyền

CREATE TABLE IF NOT EXISTS user_credentials (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'CAREGIVER', 'ADMIN') NOT NULL,
    account_status ENUM('ACTIVE', 'LOCKED', 'PENDING')
        NOT NULL DEFAULT 'PENDING',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. ACCOUNT SERVICE (PORT 3002)
-- Quản lý hồ sơ, người được chăm sóc và địa chỉ

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    date_of_birth DATE NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    avatar_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS care_recipients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    medical_notes TEXT NULL,
    emergency_contact_name VARCHAR(150) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_recipient_customer
        FOREIGN KEY (customer_id)
        REFERENCES user_profiles(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    recipient_id BIGINT UNSIGNED NULL,
    address_name VARCHAR(100) NULL,
    detail_address VARCHAR(255) NOT NULL,
    ward VARCHAR(100) NULL,
    district VARCHAR(100) NULL,
    province VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_address_user
        FOREIGN KEY (user_id)
        REFERENCES user_profiles(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_address_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES care_recipients(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. CAREGIVER MANAGEMENT SERVICE (PORT 3003)
-- Quản lý hồ sơ, giấy tờ và dịch vụ của người chăm sóc

CREATE TABLE IF NOT EXISTS caregiver_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    introduction TEXT NULL,
    qualification VARCHAR(255) NULL,
    experience_years INT UNSIGNED NOT NULL DEFAULT 0,
    license_number VARCHAR(100) NULL UNIQUE,
    verification_status ENUM('PENDING', 'APPROVED', 'REJECTED')
        NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    approved_by BIGINT UNSIGNED NULL,
    approved_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_caregiver_experience
        CHECK (experience_years >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS caregiver_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    caregiver_id BIGINT UNSIGNED NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    verification_status ENUM('PENDING', 'APPROVED', 'REJECTED')
        NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME NULL,

    CONSTRAINT fk_document_caregiver
        FOREIGN KEY (caregiver_id)
        REFERENCES caregiver_profiles(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. CARE SERVICE (PORT 3004)
-- Danh mục và thông tin dịch vụ chăm sóc

CREATE TABLE IF NOT EXISTS service_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS care_services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    price_per_hour DECIMAL(12, 2) NOT NULL,
    service_status ENUM('ACTIVE', 'INACTIVE')
        NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_category
        FOREIGN KEY (category_id)
        REFERENCES service_categories(id),

    CONSTRAINT chk_service_price
        CHECK (price_per_hour >= 0)
) ENGINE=InnoDB;

-- 5. CAREGIVER MANAGEMENT SERVICE (PORT 3003)
-- Liên kết người chăm sóc với dịch vụ và khu vực

CREATE TABLE IF NOT EXISTS caregiver_services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    caregiver_id BIGINT UNSIGNED NOT NULL,
    care_service_id BIGINT UNSIGNED NOT NULL,
    custom_price DECIMAL(12, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_caregiver_service_profile
        FOREIGN KEY (caregiver_id)
        REFERENCES caregiver_profiles(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_caregiver_care_service
        (caregiver_id, care_service_id),

    CONSTRAINT chk_custom_price
        CHECK (custom_price IS NULL OR custom_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS caregiver_service_areas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    caregiver_id BIGINT UNSIGNED NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_area_caregiver
        FOREIGN KEY (caregiver_id)
        REFERENCES caregiver_profiles(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_caregiver_area
        (caregiver_id, province, district)
) ENGINE=InnoDB;

-- 6. SCHEDULE SERVICE (PORT 3005)
-- Quản lý lịch làm việc của người chăm sóc

CREATE TABLE IF NOT EXISTS caregiver_schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    caregiver_id BIGINT UNSIGNED NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    schedule_status ENUM('AVAILABLE', 'UNAVAILABLE')
        NOT NULL DEFAULT 'AVAILABLE',
    note VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_caregiver_schedule
        (caregiver_id, work_date, start_time),

    INDEX idx_schedule_date_status
        (work_date, schedule_status),

    CONSTRAINT chk_schedule_time
        CHECK (end_time > start_time)
) ENGINE=InnoDB;

-- 7. BOOKING SERVICE (PORT 3006)
-- Quản lý yêu cầu đặt lịch chăm sóc

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    recipient_id BIGINT UNSIGNED NOT NULL,
    address_id BIGINT UNSIGNED NOT NULL,
    care_service_id BIGINT UNSIGNED NOT NULL,
    scheduled_start DATETIME NOT NULL,
    scheduled_end DATETIME NOT NULL,
    duration_hours DECIMAL(5, 2) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    booking_status ENUM(
        'PENDING',
        'CONFIRMED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',
    customer_note TEXT NULL,
    cancellation_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_booking_customer (customer_id),
    INDEX idx_booking_status_date (booking_status, scheduled_start),

    CONSTRAINT chk_booking_duration
        CHECK (duration_hours > 0),

    CONSTRAINT chk_booking_amount
        CHECK (unit_price >= 0 AND total_amount >= 0),

    CONSTRAINT chk_booking_time
        CHECK (scheduled_end > scheduled_start)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by BIGINT UNSIGNED NULL,
    note TEXT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE,

    INDEX idx_history_booking_time (booking_id, changed_at)
) ENGINE=InnoDB;

-- 8. WORKER COORDINATION SERVICE (PORT 3007)
-- Quản lý phân công người chăm sóc cho booking

CREATE TABLE IF NOT EXISTS booking_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    caregiver_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NULL,
    assignment_status ENUM(
        'ASSIGNED',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED',
        'REASSIGNED'
    ) NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    note TEXT NULL,

    INDEX idx_assignment_booking (booking_id),
    INDEX idx_assignment_caregiver (caregiver_id),
    INDEX idx_assignment_status (assignment_status)
) ENGINE=InnoDB;

-- 9. CARE RECORD SERVICE (PORT 3008)
-- Ghi nhận quá trình chăm sóc thực tế

CREATE TABLE IF NOT EXISTS care_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    assignment_id BIGINT UNSIGNED NOT NULL,
    caregiver_id BIGINT UNSIGNED NOT NULL,
    actual_start DATETIME NULL,
    actual_end DATETIME NULL,
    care_content TEXT NOT NULL,
    health_condition TEXT NULL,
    caregiver_note TEXT NULL,
    customer_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_care_session_booking (booking_id),
    INDEX idx_care_session_caregiver (caregiver_id),

    CONSTRAINT chk_care_session_time
        CHECK (
            actual_end IS NULL
            OR actual_start IS NULL
            OR actual_end >= actual_start
        )
) ENGINE=InnoDB;

-- 10. PAYMENT SERVICE (PORT 3009)
-- Quản lý giao dịch thanh toán

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    payment_method ENUM(
        'CASH',
        'BANK_TRANSFER',
        'E_WALLET'
    ) NOT NULL,
    payment_status ENUM(
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED'
    ) NOT NULL DEFAULT 'PENDING',
    transaction_reference VARCHAR(150) NULL UNIQUE,
    paid_at DATETIME NULL,
    refunded_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_payment_booking (booking_id),
    INDEX idx_payment_customer (customer_id),
    INDEX idx_payment_status (payment_status),

    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0)
) ENGINE=InnoDB;

-- 11. REVIEW SERVICE (PORT 3010)
-- Quản lý đánh giá sau khi hoàn thành dịch vụ

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    caregiver_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_review_booking (booking_id),

    INDEX idx_review_caregiver (caregiver_id),

    CONSTRAINT chk_review_rating
        CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- 12. NOTIFICATION SERVICE (PORT 3011)
-- Quản lý thông báo cho người dùng

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    notification_type ENUM(
        'BOOKING',
        'ASSIGNMENT',
        'PAYMENT',
        'SYSTEM',
        'REVIEW'
    ) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(50) NULL,
    reference_id BIGINT UNSIGNED NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notification_user_read
        (user_id, is_read, created_at)
) ENGINE=InnoDB;

