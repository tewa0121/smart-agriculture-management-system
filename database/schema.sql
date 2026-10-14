-- =========================================================
-- SMART AGRICULTURE MANAGEMENT SYSTEM
-- DATABASE SCHEMA
-- =========================================================

CREATE DATABASE IF NOT EXISTS smart_agriculture
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_agriculture;


-- =========================================================
-- 1. USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'farmer') NOT NULL DEFAULT 'farmer',
    phone VARCHAR(30),
    address VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB;


-- =========================================================
-- 2. SUPPLY APPLICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS supply_applications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    farmer_id INT UNSIGNED NOT NULL,

    supply_type ENUM(
        'fertilizer',
        'pesticide',
        'seeds',
        'equipment',
        'other'
    ) NOT NULL,

    product_name VARCHAR(150) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(30) NOT NULL,

    crop_name VARCHAR(150) DEFAULT NULL,
    farm_location VARCHAR(255) DEFAULT NULL,
    reason TEXT DEFAULT NULL,

    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'pending',

    admin_notes TEXT DEFAULT NULL,

    reviewed_by INT UNSIGNED DEFAULT NULL,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_application_farmer
        FOREIGN KEY (farmer_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_application_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_application_farmer (farmer_id),
    INDEX idx_application_status (status),
    INDEX idx_application_created (created_at)
) ENGINE=InnoDB;


-- =========================================================
-- 3. FARMS
-- =========================================================

CREATE TABLE IF NOT EXISTS farms (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    name VARCHAR(150) NOT NULL,
    location VARCHAR(255),

    total_area DECIMAL(10,2),
    area_unit VARCHAR(20) DEFAULT 'hectare',

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_farms_user (user_id)
) ENGINE=InnoDB;


-- =========================================================
-- 4. FIELDS
-- =========================================================

CREATE TABLE IF NOT EXISTS fields (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    farm_id INT UNSIGNED NOT NULL,

    name VARCHAR(150) NOT NULL,

    area DECIMAL(10,2) NOT NULL,
    area_unit VARCHAR(20) DEFAULT 'hectare',

    soil_type VARCHAR(100),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (farm_id)
        REFERENCES farms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_fields_farm (farm_id)
) ENGINE=InnoDB;


-- =========================================================
-- 5. CROP TYPES
-- =========================================================

CREATE TABLE IF NOT EXISTS crop_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    growth_duration_days INT UNSIGNED,

    recommended_irrigation_interval_days INT UNSIGNED,

    recommended_fertilizer_interval_days INT UNSIGNED,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =========================================================
-- 6. CROPS
-- =========================================================

CREATE TABLE IF NOT EXISTS crops (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    field_id INT UNSIGNED NOT NULL,

    crop_type_id INT UNSIGNED NOT NULL,

    name VARCHAR(150),

    planting_date DATE,

    expected_harvest_date DATE,

    actual_harvest_date DATE,

    status ENUM(
        'planned',
        'planted',
        'growing',
        'ready_for_harvest',
        'harvested'
    ) NOT NULL DEFAULT 'planned',

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (field_id)
        REFERENCES fields(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (crop_type_id)
        REFERENCES crop_types(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_crops_field (field_id),
    INDEX idx_crops_crop_type (crop_type_id),
    INDEX idx_crops_status (status),
    INDEX idx_crops_planting_date (planting_date)
) ENGINE=InnoDB;


-- =========================================================
-- 7. IRRIGATION METHODS
-- =========================================================

CREATE TABLE IF NOT EXISTS irrigation_methods (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =========================================================
-- 8. IRRIGATION RECORDS
-- =========================================================

CREATE TABLE IF NOT EXISTS irrigation_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    crop_id INT UNSIGNED NOT NULL,

    irrigation_method_id INT UNSIGNED,

    irrigation_date DATE NOT NULL,

    quantity DECIMAL(10,2),

    quantity_unit VARCHAR(30) DEFAULT 'liters',

    cost DECIMAL(12,2) DEFAULT 0,

    interval_days INT UNSIGNED,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (crop_id)
        REFERENCES crops(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (irrigation_method_id)
        REFERENCES irrigation_methods(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    INDEX idx_irrigation_crop (crop_id),
    INDEX idx_irrigation_date (irrigation_date)
) ENGINE=InnoDB;


-- =========================================================
-- 9. FERTILIZER TYPES
-- =========================================================

CREATE TABLE IF NOT EXISTS fertilizer_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =========================================================
-- 10. FERTILIZER RECORDS
-- =========================================================

CREATE TABLE IF NOT EXISTS fertilizer_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    crop_id INT UNSIGNED NOT NULL,

    fertilizer_type_id INT UNSIGNED,

    application_date DATE NOT NULL,

    quantity DECIMAL(10,2),

    quantity_unit VARCHAR(30) DEFAULT 'kg',

    cost DECIMAL(12,2) DEFAULT 0,

    interval_days INT UNSIGNED,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (crop_id)
        REFERENCES crops(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (fertilizer_type_id)
        REFERENCES fertilizer_types(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    INDEX idx_fertilizer_crop (crop_id),
    INDEX idx_fertilizer_date (application_date)
) ENGINE=InnoDB;


-- =========================================================
-- 11. PESTICIDE RECORDS
-- =========================================================

CREATE TABLE IF NOT EXISTS pesticide_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    crop_id INT UNSIGNED NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    application_date DATE NOT NULL,

    quantity DECIMAL(10,2),

    quantity_unit VARCHAR(30),

    cost DECIMAL(12,2) DEFAULT 0,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (crop_id)
        REFERENCES crops(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_pesticide_crop (crop_id),
    INDEX idx_pesticide_date (application_date)
) ENGINE=InnoDB;


-- =========================================================
-- 12. FARM ACTIVITIES
-- =========================================================

CREATE TABLE IF NOT EXISTS farm_activities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    crop_id INT UNSIGNED,

    field_id INT UNSIGNED,

    activity_type VARCHAR(100) NOT NULL,

    activity_date DATE NOT NULL,

    description TEXT,

    labor_cost DECIMAL(12,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (crop_id)
        REFERENCES crops(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (field_id)
        REFERENCES fields(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_activity_crop (crop_id),
    INDEX idx_activity_field (field_id),
    INDEX idx_activity_date (activity_date)
) ENGINE=InnoDB;


-- =========================================================
-- 13. EXPENSES
-- =========================================================

CREATE TABLE IF NOT EXISTS expenses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    farm_id INT UNSIGNED NOT NULL,

    field_id INT UNSIGNED,

    crop_id INT UNSIGNED,

    category ENUM(
        'fertilizer',
        'irrigation',
        'labor',
        'pesticide',
        'seeds',
        'equipment',
        'transport',
        'other'
    ) NOT NULL,

    description VARCHAR(255),

    amount DECIMAL(12,2) NOT NULL,

    expense_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (farm_id)
        REFERENCES farms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (field_id)
        REFERENCES fields(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    FOREIGN KEY (crop_id)
        REFERENCES crops(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    INDEX idx_expenses_farm (farm_id),
    INDEX idx_expenses_category (category),
    INDEX idx_expenses_date (expense_date)
) ENGINE=InnoDB;


-- =========================================================
-- 14. HARVESTS
-- =========================================================

CREATE TABLE IF NOT EXISTS harvests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    crop_id INT UNSIGNED NOT NULL,

    harvest_date DATE NOT NULL,

    quantity DECIMAL(12,2) NOT NULL,

    quantity_unit VARCHAR(30) DEFAULT 'kg',

    price_per_unit DECIMAL(12,2) DEFAULT 0,

    total_revenue DECIMAL(12,2) DEFAULT 0,

    quality VARCHAR(100),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (crop_id)
        REFERENCES crops(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_harvest_crop (crop_id),
    INDEX idx_harvest_date (harvest_date)
) ENGINE=InnoDB;


-- =========================================================
-- 15. WEATHER RECORDS
-- =========================================================

CREATE TABLE IF NOT EXISTS weather_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    farm_id INT UNSIGNED NOT NULL,

    record_date DATE NOT NULL,

    temperature DECIMAL(5,2),

    humidity DECIMAL(5,2),

    rainfall DECIMAL(8,2),

    wind_speed DECIMAL(8,2),

    weather_condition VARCHAR(100),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (farm_id)
        REFERENCES farms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_weather_farm (farm_id),
    INDEX idx_weather_date (record_date)
) ENGINE=InnoDB;