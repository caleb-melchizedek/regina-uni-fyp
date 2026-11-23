-- 1. Create the user for local connections (localhost)
CREATE USER 'support_app_user'@'localhost' IDENTIFIED BY 'StrongAppPassword123!';

-- 2. Grant privileges ONLY on single_mom_support_system_db
GRANT SELECT, INSERT, UPDATE, DELETE ON single_mom_support_system_db.* TO 'support_app_user'@'localhost';

-- 3. Apply privilege changes immediately
FLUSH PRIVILEGES;
-- ====================================

CREATE DATABASE IF NOT EXISTS single_mom_support_system_db;
USE single_mom_support_system_db;

-- 1. Users Table (Single Mothers & Admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Legal & Social Service Providers Table
CREATE TABLE IF NOT EXISTS service_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category ENUM(
        'Child Maintenance',
        'Child Custody',
        'Domestic Violence',
        'Financial & Social Aid',
        'General Legal Aid'
    ) NOT NULL,
    description TEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(100),
    is_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Assistance Requests Table (Tracks user referrals & status)
CREATE TABLE IF NOT EXISTS assistance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    issue_category VARCHAR(100) NOT NULL,
    urgency ENUM('Low', 'Medium', 'High/Emergency') DEFAULT 'Medium',
    description TEXT NOT NULL,
    status ENUM('Pending', 'Reviewed', 'Connected', 'Closed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE
);

-- Seed Sample Service Providers
INSERT INTO service_providers (
    name, category, description, address, city, contact_phone, contact_email, is_free
) VALUES
(
    'FIDA Legal Aid Clinic',
    'Child Maintenance',
    'Provides free legal representation, mediation, and advice for women seeking child maintenance and paternity support.',
    'Adabraka, Near Farrar Avenue',
    'Accra',
    '+233-302-225479',
    'info@fidaghana.org',
    TRUE
),
(
    'DOVVSU (Domestic Violence & Victim Support Unit)',
    'Domestic Violence',
    'Specialized police unit offering urgent protection, counseling, and legal referral for domestic abuse survivors.',
    'Ministries Police Station',
    'Accra',
    '0800-800-800',
    'dovvsu@police.gov.gh',
    TRUE
),
(
    'Legal Aid Commission',
    'Child Custody',
    'State-funded legal representation and family court guidance for mothers facing custody and access matters.',
    'Shiashie, East Legon',
    'Accra',
    '+233-302-544121',
    'support@legalaid.gov.gh',
    TRUE
),
(
    'Department of Social Welfare',
    'Financial & Social Aid',
    'Government social protection agency supporting vulnerable families, welfare mediation, and support referrals.',
    'Ministries Sector',
    'Accra',
    '+233-302-664511',
    'welfare@mogcsp.gov.gh',
    TRUE
);