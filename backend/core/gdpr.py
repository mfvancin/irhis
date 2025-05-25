from cryptography.fernet import Fernet
from datetime import datetime
import json
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models import User, AuditLog
import hashlib

logging.basicConfig(
    filename='gdpr_audit.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger('gdpr')

class GDPRCompliance:
    def __init__(self, encryption_key: Optional[str] = None):
        self.encryption_key = encryption_key or Fernet.generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data using Fernet symmetric encryption."""
        try:
            return self.cipher_suite.encrypt(data.encode()).decode()
        except Exception as e:
            logger.error(f"Encryption error: {str(e)}")
            raise
            
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data using Fernet symmetric encryption."""
        try:
            return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            logger.error(f"Decryption error: {str(e)}")
            raise
            
    def hash_identifier(self, identifier: str) -> str:
        """Hash identifiers for pseudonymization."""
        return hashlib.sha256(identifier.encode()).hexdigest()
        
    def log_data_access(self, db: Session, user_id: int, action: str, 
                        data_type: str, details: Dict[str, Any]) -> None:
        """Log data access for auditing purposes."""
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                data_type=data_type,
                details=json.dumps(details),
                timestamp=datetime.utcnow()
            )
            db.add(audit_log)
            db.commit()
            
            logger.info(f"Data access logged: User {user_id} performed {action} on {data_type}")
        except Exception as e:
            logger.error(f"Failed to log data access: {str(e)}")
            raise
            
    def verify_consent(self, db: Session, user_id: int) -> bool:
        """Verify if user has given consent for data processing."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        return user.consent_given and user.consent_date is not None
        
    def record_consent(self, db: Session, user_id: int, consent_type: str) -> None:
        """Record user consent with timestamp."""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.consent_given = True
                user.consent_date = datetime.utcnow()
                db.commit()
                
                self.log_data_access(
                    db=db,
                    user_id=user_id,
                    action="consent_given",
                    data_type=consent_type,
                    details={"timestamp": datetime.utcnow().isoformat()}
                )
                
                logger.info(f"Consent recorded for user {user_id}: {consent_type}")
        except Exception as e:
            logger.error(f"Failed to record consent: {str(e)}")
            raise
            
    def anonymize_data(self, data: Dict[str, Any], fields_to_anonymize: list) -> Dict[str, Any]:
        """Anonymize specified fields in the data."""
        anonymized_data = data.copy()
        for field in fields_to_anonymize:
            if field in anonymized_data:
                anonymized_data[field] = self.hash_identifier(str(anonymized_data[field]))
        return anonymized_data
        
    def generate_data_export(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Generate a GDPR-compliant data export for a user."""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")
                
            self.log_data_access(
                db=db,
                user_id=user_id,
                action="data_export",
                data_type="user_data",
                details={"timestamp": datetime.utcnow().isoformat()}
            )
            
            export_data = {
                "user_info": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "consent_given": user.consent_given,
                    "consent_date": user.consent_date.isoformat() if user.consent_date else None
                },
                "export_date": datetime.utcnow().isoformat(),
                "data_categories": [
                    "personal_information",
                    "health_metrics",
                    "exercise_data",
                    "sensor_data",
                    "consent_records"
                ]
            }
            
            return export_data
        except Exception as e:
            logger.error(f"Failed to generate data export: {str(e)}")
            raise 