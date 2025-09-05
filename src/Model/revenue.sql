CREATE TABLE IF NOT EXISTS admin_revenue (
    revenue_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    job_id INT NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins (admin_id),
    FOREIGN KEY (job_id) REFERENCES jobs (job_id)
);
