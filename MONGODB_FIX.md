# 🔧 MongoDB Atlas Connection Fix

## Your Current IP Address: 152.58.115.179

## Step 1: Whitelist IP in MongoDB Atlas

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Navigate to your cluster** (Aman0)
3. **Go to Network Access** (left sidebar)
4. **Click "Add IP Address"**
5. **Add the following IPs**:
   - Your current IP: `152.58.115.179` 
   - For development, add: `0.0.0.0/0` (Allow access from anywhere)
6. **Click "Confirm"**

## Step 2: Verify Connection String

Your current connection string should be:
```
mongodb+srv://aman:aman06@aman0.o3jy0uk.mongodb.net/?retryWrites=true&w=majority&appName=Aman0
```

## Step 3: Test Connection

After whitelisting, the MongoDB connection should work automatically.

## Alternative: Create New Connection String

If issues persist, create a new database user:
1. Go to Database Access
2. Create new user with strong password
3. Update .env file with new credentials

## Status Check

Run this command to test connection after whitelisting:
```bash
curl -X GET http://localhost:3334/api/user/test
```

If successful, you should see: `{"message":"API is working"}`
If database connects, posts endpoint should work: `curl -X GET http://localhost:3334/api/post/getposts`