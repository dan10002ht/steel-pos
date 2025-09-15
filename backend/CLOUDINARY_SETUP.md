# Cloudinary Setup for Image Upload

## Environment Variables

Add these environment variables to your `.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Getting Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy the following values:
   - **Cloud Name**: Found in the Dashboard
   - **API Key**: Found in the Dashboard
   - **API Secret**: Found in the Dashboard

## API Endpoints

### Upload Images
- **POST** `/api/images/upload`
- **Auth**: Required
- **Body**: `multipart/form-data` with `images` field
- **Response**: Array of uploaded image objects

### Delete Image
- **DELETE** `/api/images/:publicId`
- **Auth**: Required

### Delete Multiple Images
- **DELETE** `/api/images/batch`
- **Auth**: Required
- **Body**: `{"public_ids": ["id1", "id2", ...]}`

### Get Image Info
- **GET** `/api/images/:publicId`
- **Auth**: Not required

## Usage in Frontend

The PaymentModal now uploads images to Cloudinary and stores the URLs in the database.

Images are stored in the `invoice_payments` table in the `payment_images` column as a JSON array:

```json
[
  {
    "public_id": "steel-pos/payments/1234567890/image_name",
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/steel-pos/payments/1234567890/image_name.jpg"
  }
]
```
