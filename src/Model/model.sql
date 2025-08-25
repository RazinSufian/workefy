-- =========================================
-- Create and Use Database
-- =========================================
CREATE DATABASE IF NOT EXISTS workhub;

USE workhub;

-- =========================================
-- WorkHub MySQL Schema (Full)
-- =========================================

-- Drop tables if they exist (for clean rebuild)
DROP TABLE IF EXISTS disputes,
reviews,
notifications,
cashout_requests,
payments,
biddings,
job_assignments,
jobs,
categories,
worker_availability,
admins,
clients,
workers,
users;

-- =========================================
-- Users table (common for workers, clients, admins)
-- =========================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('worker', 'client', 'admin') NOT NULL,
    agreement_signed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- Workers table
-- =========================================
CREATE TABLE workers (
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skills TEXT,
    category_id INT,
    nid_number VARCHAR(50),
    nid_card_url VARCHAR(255),
    verification_status ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'pending',
    preferred_times TEXT,
    balance DECIMAL(12, 2) DEFAULT 0.00,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_jobs INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- =========================================
-- Worker Availability table
-- =========================================
CREATE TABLE worker_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    day_of_week ENUM(
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
    ) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (worker_id) REFERENCES workers (worker_id) ON DELETE CASCADE,
    UNIQUE (
        worker_id,
        day_of_week,
        start_time,
        end_time
    )
);

-- =========================================
-- Clients table
-- =========================================
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    safety_agreement_accepted BOOLEAN DEFAULT FALSE,
    total_jobs_posted INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- =========================================
-- Admins table
-- =========================================
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permissions TEXT,
    commission_percentage DECIMAL(5, 2) DEFAULT 15.00,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- =========================================
-- Categories table
-- =========================================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- =========================================
-- Jobs table
-- =========================================
CREATE TABLE jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    duration_type ENUM('hour', 'day', 'week') NOT NULL,
    duration_value INT,
    workers_needed INT DEFAULT 1,
    budget DECIMAL(12, 2),
    job_type ENUM('bidding', 'direct_hire') NOT NULL,
    status ENUM(
        'posted',
        'assigned',
        'in_progress',
        'completed',
        'cancelled'
    ) DEFAULT 'posted',
    start_date DATETIME,
    payment_type ENUM('online', 'manual'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (client_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
);

-- =========================================
-- Job Assignments table
-- =========================================
CREATE TABLE job_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    assigned_by INT NOT NULL, -- admin_id
    status ENUM(
        'assigned',
        'completed',
        'cancelled'
    ) DEFAULT 'assigned',
    FOREIGN KEY (job_id) REFERENCES jobs (job_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers (worker_id),
    FOREIGN KEY (assigned_by) REFERENCES admins (admin_id)
);

-- =========================================
-- Biddings table
-- =========================================
CREATE TABLE biddings (
    bid_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    bid_amount DECIMAL(12, 2),
    message TEXT,
    status ENUM(
        'pending',
        'accepted',
        'rejected'
    ) DEFAULT 'pending',
    FOREIGN KEY (job_id) REFERENCES jobs (job_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers (worker_id)
);

-- =========================================
-- Payments table
-- =========================================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    client_id INT NOT NULL,
    worker_id INT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    admin_commission DECIMAL(12, 2) NOT NULL,
    worker_amount DECIMAL(12, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2) DEFAULT 15.00,
    payment_type ENUM('online', 'manual'),
    status ENUM(
        'pending',
        'completed',
        'failed'
    ) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (job_id),
    FOREIGN KEY (client_id) REFERENCES clients (client_id),
    FOREIGN KEY (worker_id) REFERENCES workers (worker_id)
);

-- =========================================
-- Cashout Requests table
-- =========================================
CREATE TABLE cashout_requests (
    cashout_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    bank_routing VARCHAR(20),
    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'pending',
    admin_notes TEXT,
    processed_by INT, -- admin_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY (worker_id) REFERENCES workers (worker_id),
    FOREIGN KEY (processed_by) REFERENCES admins (admin_id)
);

-- =========================================
-- Notifications table
-- =========================================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50),
    title VARCHAR(150),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- =========================================
-- Reviews table
-- =========================================
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    reviewer_id INT NOT NULL, -- user_id
    reviewee_id INT NOT NULL, -- user_id
    rating DECIMAL(2, 1) CHECK (
        rating >= 0
        AND rating <= 5
    ),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (job_id),
    FOREIGN KEY (reviewer_id) REFERENCES users (user_id),
    FOREIGN KEY (reviewee_id) REFERENCES users (user_id)
);

-- =========================================
-- Disputes table
-- =========================================
CREATE TABLE disputes (
    dispute_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    client_id INT NOT NULL,
    worker_id INT NOT NULL,
    reason VARCHAR(255),
    description TEXT,
    status ENUM(
        'open',
        'resolved',
        'rejected'
    ) DEFAULT 'open',
    admin_notes TEXT,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (job_id),
    FOREIGN KEY (client_id) REFERENCES clients (client_id),
    FOREIGN KEY (worker_id) REFERENCES workers (worker_id)
);