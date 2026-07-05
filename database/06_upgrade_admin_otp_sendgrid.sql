USE mary_mother_cms;

CREATE TABLE IF NOT EXISTS admin_login_otps (
  otp_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  otp_hash VARCHAR(160) NOT NULL,
  otp_salt VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_otp_user_upgrade
    FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_otps_user_expiry ON admin_login_otps(admin_id, expires_at);

CREATE TABLE IF NOT EXISTS admin_otp_trusted_devices (
  trusted_device_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  token_hash VARCHAR(160) NOT NULL UNIQUE,
  user_agent VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  last_used_at DATETIME NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_trusted_device_user_upgrade
    FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_trusted_devices_user_expiry ON admin_otp_trusted_devices(admin_id, expires_at);
