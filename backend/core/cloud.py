import boto3
from botocore.exceptions import ClientError
import redis
from typing import Optional, Dict, Any
import json
import logging
from .config import settings

logger = logging.getLogger(__name__)

class CloudService:
    def __init__(self):
        self.s3_client = None
        self.sqs_client = None
        self.redis_client = None
        self._initialize_clients()

    def _initialize_clients(self):
        if settings.CLOUD_PROVIDER == "aws":
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                region_name=settings.CLOUD_REGION
            )
            self.sqs_client = boto3.client(
                'sqs',
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                region_name=settings.CLOUD_REGION
            )
        
        self.redis_client = redis.from_url(settings.REDIS_URL)

    async def store_sensor_data(self, user_id: int, data: Dict[str, Any]) -> str:
        """Store sensor data in cloud storage."""
        try:
            key = f"sensor_data/{user_id}/{data['timestamp']}.json"
            self.s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key,
                Body=json.dumps(data),
                ContentType='application/json'
            )
            return key
        except ClientError as e:
            logger.error(f"Error storing sensor data: {e}")
            raise

    async def get_sensor_data(self, key: str) -> Dict[str, Any]:
        """Retrieve sensor data from cloud storage."""
        try:
            response = self.s3_client.get_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key
            )
            return json.loads(response['Body'].read().decode('utf-8'))
        except ClientError as e:
            logger.error(f"Error retrieving sensor data: {e}")
            raise

    async def queue_processing_task(self, task_type: str, data: Dict[str, Any]) -> str:
        """Queue a task for processing."""
        try:
            message = {
                'task_type': task_type,
                'data': data
            }
            response = self.sqs_client.send_message(
                QueueUrl=settings.QUEUE_URL,
                MessageBody=json.dumps(message)
            )
            return response['MessageId']
        except ClientError as e:
            logger.error(f"Error queueing task: {e}")
            raise

    async def cache_user_data(self, user_id: int, data: Dict[str, Any], ttl: int = 3600) -> bool:
        """Cache user data in Redis."""
        try:
            key = f"user:{user_id}"
            self.redis_client.setex(
                key,
                ttl,
                json.dumps(data)
            )
            return True
        except Exception as e:
            logger.error(f"Error caching user data: {e}")
            return False

    async def get_cached_user_data(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve cached user data from Redis."""
        try:
            key = f"user:{user_id}"
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Error retrieving cached user data: {e}")
            return None

    async def delete_cached_user_data(self, user_id: int) -> bool:
        """Delete cached user data from Redis."""
        try:
            key = f"user:{user_id}"
            self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Error deleting cached user data: {e}")
            return False

cloud_service = CloudService() 