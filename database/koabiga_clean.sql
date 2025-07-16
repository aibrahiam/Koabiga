-- Koabiga Database Schema
-- PostgreSQL-compatible version

CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(255),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE TABLE cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE TABLE crops (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    crop_name VARCHAR(255),
    type VARCHAR(255) NOT NULL,
    crop_type VARCHAR(255),
    variety VARCHAR(255),
    planting_date DATE,
    expected_harvest_date DATE,
    area_planted NUMERIC(8,2),
    seed_quantity NUMERIC(8,2),
    land_id BIGINT,
    unit_id BIGINT,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE error_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    level VARCHAR(255) DEFAULT 'error' NOT NULL CHECK (level IN ('error', 'warning', 'info', 'debug')),
    message TEXT NOT NULL,
    stack_trace TEXT,
    file VARCHAR(255),
    line INTEGER,
    context JSONB,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_at TIMESTAMP,
    resolved_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE fee_applications (
    id BIGSERIAL PRIMARY KEY,
    fee_rule_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    unit_id BIGINT,
    amount NUMERIC(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(255) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fee_rule_unit_assignments (
    id BIGSERIAL PRIMARY KEY,
    fee_rule_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    custom_amount NUMERIC(10,2),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fee_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'active' NOT NULL,
    applicable_to VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    effective_date DATE NOT NULL,
    created_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE form_submissions (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    data JSONB NOT NULL,
    status VARCHAR(255) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forms (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    form_data JSONB NOT NULL,
    type VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'active' NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    assigned_to JSONB,
    due_date DATE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lands (
    id BIGSERIAL PRIMARY KEY,
    land_number VARCHAR(255) UNIQUE NOT NULL,
    area NUMERIC(8,2) NOT NULL,
    location VARCHAR(255),
    soil_type VARCHAR(255),
    irrigation_status VARCHAR(255),
    user_id BIGINT,
    unit_id BIGINT,
    zone_id BIGINT,
    status VARCHAR(255) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(255),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE member_fees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    fee_rule_id BIGINT,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(255) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    status VARCHAR(255) DEFAULT 'published' NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produces (
    id BIGSERIAL PRIMARY KEY,
    crop_id BIGINT NOT NULL,
    quantity NUMERIC(8,2) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    harvest_date DATE NOT NULL,
    quality_grade VARCHAR(255),
    notes TEXT,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    generated_by BIGINT NOT NULL,
    unit_id BIGINT,
    zone_id BIGINT,
    date_range_start DATE,
    date_range_end DATE,
    status VARCHAR(255) DEFAULT 'generated' NOT NULL,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100),
    role VARCHAR(255) DEFAULT 'member' NOT NULL CHECK (role IN ('admin', 'leader', 'member')),
    unit_id BIGINT,
    zone_id BIGINT,
    phone VARCHAR(255),
    secondary_phone VARCHAR(255),
    pin VARCHAR(255),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(255),
    profile_photo VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    leader_id BIGINT,
    zone_id BIGINT,
    status VARCHAR(255) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zones (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    leader_id BIGINT,
    location VARCHAR(255),
    status VARCHAR(255) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL,
    reserved_at INTEGER,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table (for Laravel session storage)
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_crops_user_id ON crops(user_id);
CREATE INDEX idx_crops_land_id ON crops(land_id);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_level ON error_logs(level);
CREATE INDEX idx_fee_applications_user_id ON fee_applications(user_id);
CREATE INDEX idx_fee_applications_fee_rule_id ON fee_applications(fee_rule_id);
CREATE INDEX idx_fee_rule_unit_assignments_fee_rule_id ON fee_rule_unit_assignments(fee_rule_id);
CREATE INDEX idx_fee_rule_unit_assignments_unit_id ON fee_rule_unit_assignments(unit_id);
CREATE INDEX idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_lands_user_id ON lands(user_id);
CREATE INDEX idx_lands_unit_id ON lands(unit_id);
CREATE INDEX idx_lands_zone_id ON lands(zone_id);
CREATE INDEX idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX idx_login_sessions_session_id ON login_sessions(session_id);
CREATE INDEX idx_member_fees_user_id ON member_fees(user_id);
CREATE INDEX idx_member_fees_fee_rule_id ON member_fees(fee_rule_id);
CREATE INDEX idx_produces_crop_id ON produces(crop_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_unit_id ON reports(unit_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_unit_id ON users(unit_id);
CREATE INDEX idx_users_zone_id ON users(zone_id);
CREATE INDEX idx_units_zone_id ON units(zone_id);
CREATE INDEX idx_units_leader_id ON units(leader_id);
CREATE INDEX idx_zones_leader_id ON zones(leader_id);
CREATE INDEX idx_jobs_queue ON jobs(queue);
CREATE INDEX idx_jobs_queue_index ON jobs(queue, reserved_at);
CREATE INDEX idx_personal_access_tokens_tokenable_type_tokenable_id ON personal_access_tokens(tokenable_type, tokenable_id);

INSERT INTO users (id, name, email, password, role, is_active, created_at, updated_at) VALUES 
(1, 'Admin User', 'admin@koabiga.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO zones (id, name, description, leader_id, location, status, created_at, updated_at) VALUES 
(1, 'Zone A', 'North Zone', 1, 'Northern Region', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Zone B', 'South Zone', 1, 'Southern Region', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO units (id, name, description, leader_id, zone_id, status, created_at, updated_at) VALUES 
(1, 'Unit 1', 'First Unit', 1, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Unit 2', 'Second Unit', 1, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Unit 3', 'Third Unit', 1, 2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO fee_rules (id, name, type, amount, frequency, unit, status, applicable_to, description, effective_date, created_by, created_at, updated_at) VALUES 
(1, 'Monthly Membership Fee', 'membership', 50.00, 'monthly', 'per_member', 'active', 'members', 'Monthly membership fee for all members', '2024-01-01', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Land Usage Fee', 'land', 25.00, 'monthly', 'per_land', 'active', 'members', 'Monthly fee for land usage', '2024-01-01', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO forms (id, title, description, form_data, type, status, is_required, created_by, created_at, updated_at) VALUES 
(1, 'Crop Registration', 'Register new crops', '{"fields": [{"name": "crop_name", "type": "text", "label": "Crop Name", "required": true}]}', 'crop_registration', 'active', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Land Assignment', 'Assign land to members', '{"fields": [{"name": "land_number", "type": "text", "label": "Land Number", "required": true}]}', 'land_assignment', 'active', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 