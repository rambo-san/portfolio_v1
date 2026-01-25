# Fixing Firebase Storage Issues

If you are seeing "Permission denied" or generic errors when uploading images, follow these steps.

## 1. Update Storage Rules
Your Firebase Storage rules likely default to "read only" or "authenticated only". Since you are logged in, authenticated only *should* work, but let's verify.

Go to [Firebase Console](https://console.firebase.google.com/) > **Storage** > **Rules** and paste this:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow read/write if the user is authenticated
      allow read, write: if request.auth != null;
    }
  }
}
```

## 2. Configure CORS (Crucial for Localhost)
If you are developing on `localhost:3000`, the browser will often block uploads to Firebase Storage unless you configure CORS.

1. Create a file named `cors.json` on your computer:
```json
[
  {
    "origin": ["http://localhost:3000", "https://your-production-domain.com"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

2. Download `gsutil` or keeping it simple, use the Google Cloud Console.
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project (`myportfolio-753fe`)
   - Activate the **Cloud Shell** (icon in top right)
   - Click the "Open Editor" icon to create the `cors.json` file there.
   - Run this command in the Cloud Shell terminal:
     ```bash
     gsutil cors set cors.json gs://myportfolio-753fe.firebasestorage.app
     ```

## 3. Verify Bucket Name
Ensure your bucket name in `src/lib/firebase/config.ts` matches exactly what is in your Firebase Console > Storage.
It is currently set to: `myportfolio-753fe.firebasestorage.app`
