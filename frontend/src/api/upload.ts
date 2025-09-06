import {
  UploadResponse,
  User,
  Post,
} from '@/types';
import { apiUpload, apiPost, extractData } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/config';

export const uploadApi = {
  // Upload avatar image
  uploadAvatar: async (
    file: File,
    onProgress?: (progressEvent: any) => void
  ): Promise<{ url: string; user: User }> => {
    const response = await apiUpload<{ url: string; user: User }>(
      API_ENDPOINTS.upload.avatar,
      file,
      {},
      onProgress
    );
    return extractData(response);
  },

  // Upload featured image for a post
  uploadPostImage: async (
    postId: string,
    file: File,
    onProgress?: (progressEvent: any) => void
  ): Promise<{ url: string; post: Post }> => {
    const response = await apiUpload<{ url: string; post: Post }>(
      API_ENDPOINTS.upload.postImage(postId),
      file,
      {},
      onProgress
    );
    return extractData(response);
  },

  // Upload general image
  uploadImage: async (
    file: File,
    folder?: string,
    onProgress?: (progressEvent: any) => void
  ): Promise<UploadResponse> => {
    const additionalData = folder ? { folder } : {};
    const response = await apiUpload<UploadResponse>(
      API_ENDPOINTS.upload.image,
      file,
      additionalData,
      onProgress
    );
    return extractData(response);
  },

  // Delete an uploaded image
  deleteImage: async (imageUrl: string): Promise<void> => {
    await apiPost(API_ENDPOINTS.upload.delete, { imageUrl });
  },

  // Get image info without uploading
  getImageInfo: async (file: File): Promise<{
    originalName: string;
    mimetype: string;
    size: number;
    sizeInMB: string;
  }> => {
    const response = await apiUpload(API_ENDPOINTS.upload.info, file);
    return extractData(response);
  },

  // Validate file before upload
  validateFile: (file: File): { valid: boolean; error?: string } => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'File too large. Maximum size is 5MB.' };
    }

    if (!ALLOWED_TYPES.includes(file.mimetype || file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
    }

    return { valid: true };
  },

  // Create image preview URL
  createPreviewUrl: (file: File): string => {
    return URL.createObjectURL(file);
  },

  // Revoke preview URL to free memory
  revokePreviewUrl: (url: string): void => {
    URL.revokeObjectURL(url);
  },

  // Compress image before upload (client-side)
  compressImage: async (
    file: File,
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Get file size in human readable format
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

export default uploadApi;