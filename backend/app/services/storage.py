"""
Storage service for handling file uploads to S3 or Supabase Storage.

This module provides functions to upload, retrieve, and manage files in cloud storage.
"""
import os
import uuid
from typing import Any, BinaryIO, Dict, Optional

import boto3
from fastapi import UploadFile

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


async def upload_file(
    file: UploadFile,
    folder: str = "uploads",
    custom_filename: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Upload a file to S3 storage.
    
    Args:
        file: File to upload
        folder: Folder path within the bucket
        custom_filename: Optional custom filename
        
    Returns:
        Dict[str, Any]: Dictionary containing file information
    """
    try:
        # Generate a unique filename if not provided
        if custom_filename:
            filename = custom_filename
        else:
            # Get file extension
            _, ext = os.path.splitext(file.filename)
            # Generate unique filename
            filename = f"{uuid.uuid4()}{ext}"
        
        # Create full path
        file_path = f"{folder}/{filename}"
        
        logger.info(f"Uploading file to {file_path}")
        
        # Read file content
        file_content = await file.read()
        
        # Upload to S3
        s3_client.put_object(
            Bucket=settings.AWS_BUCKET_NAME,
            Key=file_path,
            Body=file_content,
            ContentType=file.content_type,
        )
        
        # Generate public URL
        file_url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{file_path}"
        
        logger.info(f"File uploaded successfully: {file_url}")
        
        return {
            "filename": filename,
            "content_type": file.content_type,
            "size": len(file_content),
            "path": file_path,
            "url": file_url,
        }
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise
    finally:
        # Reset file pointer for potential reuse
        await file.seek(0)


async def delete_file(file_path: str) -> bool:
    """
    Delete a file from S3 storage.
    
    Args:
        file_path: Path to the file within the bucket
        
    Returns:
        bool: True if deletion was successful
    """
    try:
        logger.info(f"Deleting file: {file_path}")
        
        # Delete from S3
        s3_client.delete_object(
            Bucket=settings.AWS_BUCKET_NAME,
            Key=file_path,
        )
        
        logger.info(f"File deleted successfully: {file_path}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        return False


async def get_file_url(file_path: str, expiration: int = 3600) -> str:
    """
    Generate a pre-signed URL for accessing a file.
    
    Args:
        file_path: Path to the file within the bucket
        expiration: URL expiration time in seconds
        
    Returns:
        str: Pre-signed URL for file access
    """
    try:
        logger.info(f"Generating pre-signed URL for: {file_path}")
        
        # Generate pre-signed URL
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.AWS_BUCKET_NAME,
                "Key": file_path,
            },
            ExpiresIn=expiration,
        )
        
        return url
        
    except Exception as e:
        logger.error(f"Error generating pre-signed URL: {str(e)}")
        # Return public URL as fallback
        return f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{file_path}"
