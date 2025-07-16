-- =====================================================
-- KOABIGA FRESH DATABASE SCHEMA (PostgreSQL Compatible)
-- =====================================================

-- Drop all existing tables (if they exist)
DROP TABLE IF EXISTS fee_rule_unit_assignments CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS member_fees CASCADE;
DROP TABLE IF EXISTS fee_applications CASCADE;
DROP TABLE IF EXISTS produces CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS lands CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS fee_rules CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS login_sessions CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS failed_jobs CASCADE;
DROP TABLE IF EXISTS personal_access_tokens CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;
DROP TABLE IF EXISTS cache CASCADE;
DROP TABLE IF EXISTS cache_locks CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- =====================================================
-- CORE LARAVEL TABLES
-- =====================================================

-- Users table (with all Koabiga fields)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    christian_name VARCHAR(255) NULL,
    family_name VARCHAR(255) NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255) UNIQUE NULL,
    id_passport VARCHAR(255) UNIQUE NULL,
    national_id VARCHAR(25) NULL,
    gender VARCHAR(10) NULL CHECK (gender IN ('male', 'female')),
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'unit_leader', 'zone_leader', 'member')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    pin VARCHAR(5) NULL,
    unit_id BIGINT NULL,
    zone_id BIGINT NULL,
    last_login_at TIMESTAMP NULL,
    last_activity_at TIMESTAMP NULL,
    bio TEXT NULL,
    avatar VARCHAR(255) NULL,
    secondary_phone VARCHAR(255) UNIQUE NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);

-- Sessions
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

-- Failed jobs
CREATE TABLE failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal access tokens
CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Cache tables
CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE TABLE cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

-- Migrations table
CREATE TABLE migrations (
    id BIGSERIAL PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INTEGER NOT NULL
);

-- =====================================================
-- KOABIGA APPLICATION TABLES
-- =====================================================

-- Zones table
CREATE TABLE zones (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    leader_id BIGINT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    location VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Units table
CREATE TABLE units (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    zone_id BIGINT NULL,
    leader_id BIGINT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Fee rules table
CREATE TABLE fee_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'active',
    applicable_to VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    effective_date DATE NOT NULL,
    created_by VARCHAR(255) NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

-- Forms table
CREATE TABLE forms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(255) DEFAULT 'request',
    category VARCHAR(255) DEFAULT 'other',
    description TEXT NULL,
    fields JSON NULL,
    target_roles JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Lands table
CREATE TABLE lands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    area DECIMAL(8,2) NULL,
    location VARCHAR(255) NULL,
    soil_type VARCHAR(255) NULL,
    user_id BIGINT NOT NULL,
    unit_id BIGINT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Crops table
CREATE TABLE crops (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    crop_name VARCHAR(255) NULL,
    type VARCHAR(255) NOT NULL,
    crop_type VARCHAR(255) NULL,
    variety VARCHAR(255) NULL,
    planting_date DATE NULL,
    expected_harvest_date DATE NULL,
    area_planted DECIMAL(8,2) NULL,
    seed_quantity DECIMAL(8,2) NULL,
    land_id BIGINT NULL,
    unit_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Produces table
CREATE TABLE produces (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    quantity DECIMAL(10,2) NULL,
    unit VARCHAR(50) NULL,
    harvest_date DATE NULL,
    quality_grade VARCHAR(50) NULL,
    crop_id BIGINT NULL,
    land_id BIGINT NULL,
    unit_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Activity logs table
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(255) NULL,
    user_agent TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Login sessions table
CREATE TABLE login_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255) NULL,
    user_agent TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    login_at TIMESTAMP NOT NULL,
    logout_at TIMESTAMP NULL,
    last_activity_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Reports table
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    type VARCHAR(20) DEFAULT 'activity' CHECK (type IN ('crop', 'land', 'produce', 'financial', 'activity', 'other')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    approved_by BIGINT NULL,
    unit_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Fee applications table
CREATE TABLE fee_applications (
    id BIGSERIAL PRIMARY KEY,
    fee_rule_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    unit_id BIGINT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    notes TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Error logs table
CREATE TABLE error_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL,
    level VARCHAR(10) DEFAULT 'error' CHECK (level IN ('error', 'warning', 'info', 'debug')),
    message TEXT NOT NULL,
    stack_trace TEXT NULL,
    file VARCHAR(255) NULL,
    line INTEGER NULL,
    context JSON NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    resolved_by BIGINT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Pages table
CREATE TABLE pages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    path VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'unit_leader', 'member')),
    description TEXT NULL,
    features JSON NULL,
    permissions JSON NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'inactive')),
    icon VARCHAR(50) NULL,
    sort_order INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Member fees table
CREATE TABLE member_fees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    fee_rule_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_date TIMESTAMP NULL,
    payment_method VARCHAR(255) NULL,
    reference_number VARCHAR(255) NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'cancelled')),
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Form submissions table
CREATE TABLE form_submissions (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    data JSON NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT NULL,
    comments TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Fee rule unit assignments table
CREATE TABLE fee_rule_unit_assignments (
    id BIGSERIAL PRIMARY KEY,
    fee_rule_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    custom_amount DECIMAL(10,2) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Users table foreign keys
ALTER TABLE users ADD CONSTRAINT fk_users_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_zone_id FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL;

-- Zones table foreign keys
ALTER TABLE zones ADD CONSTRAINT fk_zones_leader_id FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL;

-- Units table foreign keys
ALTER TABLE units ADD CONSTRAINT fk_units_zone_id FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE;
ALTER TABLE units ADD CONSTRAINT fk_units_leader_id FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL;

-- Lands table foreign keys
ALTER TABLE lands ADD CONSTRAINT fk_lands_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE lands ADD CONSTRAINT fk_lands_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;

-- Crops table foreign keys
ALTER TABLE crops ADD CONSTRAINT fk_crops_land_id FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE CASCADE;
ALTER TABLE crops ADD CONSTRAINT fk_crops_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;
ALTER TABLE crops ADD CONSTRAINT fk_crops_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Produces table foreign keys
ALTER TABLE produces ADD CONSTRAINT fk_produces_crop_id FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE;
ALTER TABLE produces ADD CONSTRAINT fk_produces_land_id FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE CASCADE;
ALTER TABLE produces ADD CONSTRAINT fk_produces_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;
ALTER TABLE produces ADD CONSTRAINT fk_produces_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Activity logs table foreign keys
ALTER TABLE activity_logs ADD CONSTRAINT fk_activity_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Login sessions table foreign keys
ALTER TABLE login_sessions ADD CONSTRAINT fk_login_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Reports table foreign keys
ALTER TABLE reports ADD CONSTRAINT fk_reports_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE reports ADD CONSTRAINT fk_reports_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;
ALTER TABLE reports ADD CONSTRAINT fk_reports_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fee applications table foreign keys
ALTER TABLE fee_applications ADD CONSTRAINT fk_fee_applications_fee_rule_id FOREIGN KEY (fee_rule_id) REFERENCES fee_rules(id) ON DELETE CASCADE;
ALTER TABLE fee_applications ADD CONSTRAINT fk_fee_applications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE fee_applications ADD CONSTRAINT fk_fee_applications_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;

-- Error logs table foreign keys
ALTER TABLE error_logs ADD CONSTRAINT fk_error_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE error_logs ADD CONSTRAINT fk_error_logs_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Pages table foreign keys
ALTER TABLE pages ADD CONSTRAINT fk_pages_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE pages ADD CONSTRAINT fk_pages_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Member fees table foreign keys
ALTER TABLE member_fees ADD CONSTRAINT fk_member_fees_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE member_fees ADD CONSTRAINT fk_member_fees_fee_rule_id FOREIGN KEY (fee_rule_id) REFERENCES fee_rules(id) ON DELETE CASCADE;

-- Form submissions table foreign keys
ALTER TABLE form_submissions ADD CONSTRAINT fk_form_submissions_form_id FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE;
ALTER TABLE form_submissions ADD CONSTRAINT fk_form_submissions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE form_submissions ADD CONSTRAINT fk_form_submissions_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Fee rule unit assignments table foreign keys
ALTER TABLE fee_rule_unit_assignments ADD CONSTRAINT fk_fee_rule_unit_assignments_fee_rule_id FOREIGN KEY (fee_rule_id) REFERENCES fee_rules(id) ON DELETE CASCADE;
ALTER TABLE fee_rule_unit_assignments ADD CONSTRAINT fk_fee_rule_unit_assignments_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_unit_id_status ON users(unit_id, status);
CREATE INDEX idx_users_zone_id_status ON users(zone_id, status);
CREATE INDEX idx_users_last_activity_at ON users(last_activity_at);

-- Zones table indexes
CREATE INDEX idx_zones_leader_id_status ON zones(leader_id, status);

-- Units table indexes
CREATE INDEX idx_units_zone_id_status ON units(zone_id, status);
CREATE INDEX idx_units_leader_id_status ON units(leader_id, status);

-- Fee rules table indexes
CREATE INDEX idx_fee_rules_status_effective_date ON fee_rules(status, effective_date);
CREATE INDEX idx_fee_rules_type_status ON fee_rules(type, status);
CREATE INDEX idx_fee_rules_is_deleted ON fee_rules(is_deleted);

-- Lands table indexes
CREATE INDEX idx_lands_user_id ON lands(user_id);
CREATE INDEX idx_lands_unit_id ON lands(unit_id);

-- Crops table indexes
CREATE INDEX idx_crops_land_id ON crops(land_id);
CREATE INDEX idx_crops_unit_id ON crops(unit_id);
CREATE INDEX idx_crops_user_id ON crops(user_id);

-- Produces table indexes
CREATE INDEX idx_produces_crop_id_harvest_date ON produces(crop_id, harvest_date);
CREATE INDEX idx_produces_unit_id_harvest_date ON produces(unit_id, harvest_date);
CREATE INDEX idx_produces_user_id_harvest_date ON produces(user_id, harvest_date);
CREATE INDEX idx_produces_quality_grade ON produces(quality_grade);

-- Activity logs table indexes
CREATE INDEX idx_activity_logs_user_id_created_at ON activity_logs(user_id, created_at);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Login sessions table indexes
CREATE INDEX idx_login_sessions_user_id_is_active ON login_sessions(user_id, is_active);
CREATE INDEX idx_login_sessions_session_id ON login_sessions(session_id);
CREATE INDEX idx_login_sessions_login_at ON login_sessions(login_at);

-- Reports table indexes
CREATE INDEX idx_reports_status_type ON reports(status, type);
CREATE INDEX idx_reports_unit_id_status ON reports(unit_id, status);
CREATE INDEX idx_reports_user_id_status ON reports(user_id, status);
CREATE INDEX idx_reports_submitted_at ON reports(submitted_at);

-- Fee applications table indexes
CREATE INDEX idx_fee_applications_user_id_status ON fee_applications(user_id, status);
CREATE INDEX idx_fee_applications_unit_id_status ON fee_applications(unit_id, status);
CREATE INDEX idx_fee_applications_fee_rule_id_status ON fee_applications(fee_rule_id, status);
CREATE INDEX idx_fee_applications_due_date ON fee_applications(due_date);

-- Error logs table indexes
CREATE INDEX idx_error_logs_level_resolved ON error_logs(level, resolved);
CREATE INDEX idx_error_logs_user_id_created_at ON error_logs(user_id, created_at);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

-- Pages table indexes
CREATE INDEX idx_pages_role_status ON pages(role, status);
CREATE INDEX idx_pages_is_public_status ON pages(is_public, status);
CREATE INDEX idx_pages_sort_order ON pages(sort_order);

-- Member fees table indexes
CREATE INDEX idx_member_fees_user_id_status ON member_fees(user_id, status);
CREATE INDEX idx_member_fees_fee_rule_id_status ON member_fees(fee_rule_id, status);
CREATE INDEX idx_member_fees_payment_date ON member_fees(payment_date);

-- Form submissions table indexes
CREATE INDEX idx_form_submissions_form_id_status ON form_submissions(form_id, status);
CREATE INDEX idx_form_submissions_user_id_status ON form_submissions(user_id, status);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at);

-- Fee rule unit assignments table indexes
CREATE INDEX idx_fee_rule_unit_assignments_unit_id_is_active ON fee_rule_unit_assignments(unit_id, is_active);

-- Unique constraints
ALTER TABLE fee_rule_unit_assignments ADD CONSTRAINT unique_fee_rule_unit UNIQUE (fee_rule_id, unit_id);

-- =====================================================
-- MIGRATION RECORDS
-- =====================================================

-- Insert migration records to mark all migrations as completed
INSERT INTO migrations (migration, batch) VALUES
('0001_01_01_000000_create_users_table', 1),
('0001_01_01_000001_create_cache_table', 1),
('0001_01_01_000002_create_jobs_table', 1),
('2025_06_30_041321_create_fee_rules_table', 1),
('2025_07_10_000000_create_forms_table', 1),
('2025_07_10_000001_create_units_table', 1),
('2025_07_10_000002_create_zones_table', 1),
('2025_07_11_000000_create_lands_table', 1),
('2025_07_12_000000_create_crops_table', 1),
('2025_07_14_143127_create_activity_logs_table', 1),
('2025_07_14_143340_create_login_sessions_table', 1),
('2025_07_14_164620_add_koabiga_fields_to_users_table', 1),
('2025_07_15_012512_create_reports_table', 1),
('2025_07_15_015053_add_missing_columns_to_forms_table', 1),
('2025_07_15_020000_create_fee_applications_table', 1),
('2025_07_15_021000_create_error_logs_table', 1),
('2025_07_15_022000_create_pages_table', 1),
('2025_07_15_023000_create_member_fees_table', 1),
('2025_07_15_024000_create_form_submissions_table', 1),
('2025_07_15_025000_create_fee_rule_unit_assignments_table', 1),
('2025_07_15_215145_add_location_to_zones_table', 1),
('2025_07_16_074506_add_missing_fields_to_users_table', 1),
('2025_07_16_080014_create_produces_table', 1),
('2025_07_16_083904_fix_pin_field_length_in_users_table', 1),
('2025_07_16_093111_add_secondary_phone_to_users_table', 1);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Koabiga database schema created successfully!' as message;