# Admin Assignment Access Debugging Guide

## Backend Status ✅
- Admin user exists: `admin@college.edu`
- Assignments exist in database: **1 assignment** (Java Fundamentals)
- Backend API is functional

## Frontend Debugging Steps

### Step 1: Clear Browser Cache & LocalStorage
```javascript
// Open browser DevTools (F12) → Console tab, paste this:
localStorage.clear();
sessionStorage.clear();
// Refresh page
window.location.reload();
```

### Step 2: Login Again as Admin
- Clear browser cache first (Ctrl+Shift+Delete)
- Go to http://localhost:5173
- Select **"Admin"** tab
- Email: `admin@college.edu`
- Password: `Admin@123`
- Click Sign In

### Step 3: Check Console Logs
While logging in, open browser **F12 → Console** and look for:

**Expected logs during admin login:**
```
🔐 Admin login attempt: admin@college.edu
Login response received: {...}
   Response role: admin
   Response studentId: undefined
User and token stored in localStorage
User state updated in context
   User object: {role: 'admin', name: 'System Admin', studentId: undefined}
Login useEffect triggered - user state: {role: 'admin', name: 'System Admin', studentId: undefined}
Navigating to dashboard: /admin
AdminLayout: Admin logged in successfully {role: 'admin', name: 'System Admin'}
```

### Step 4: After Logging In Successfully
- Open **DevTools → Console**
- Look for any red error messages
- Check if you see the Sidebar with "AcadEdge Staff Portal"
- Click on **"Assignments"** in sidebar
- Watch console for logs

**When clicking Assignments, you should see:**
```
AdminAssignments component mounted
Fetching assignments...
Assignments fetched: [...]
```

### Step 5: If Redirected to Dashboard
If you're redirected back to /admin dashboard, the console will show:
```
AdminAssignments component mounted
Fetching assignments...
Failed to fetch assignments: ...
```

**Check the error message** - it will tell us what's wrong.

### Step 6: Check LocalStorage
In **DevTools → Application → LocalStorage → http://localhost:5173**:
- Look for keys: `token` and `user`
- Click on `user` and verify:
  - `role: "admin"` (NOT "student")
  - `name: "System Admin"` (or whatever)
  - Should NOT have `studentId`

Example of correct admin user object:
```json
{
  "_id": "...",
  "name": "System Admin",
  "email": "admin@college.edu",
  "role": "admin",
  "token": "eyJhbGc..."
}
```

## Possible Issues & Solutions

### Issue 1: Shows "Navigating to dashboard: /student" instead of "/admin"
**Problem:** User role is being saved as 'student' instead of 'admin'
**Solution:** Check backend login response - verify it's returning `"role": "admin"`

### Issue 2: "AdminLayout: User is not admin, redirecting to student"
**Problem:** User state doesn't have admin role after login
**Solution:** 
- Check if login response included the role correctly
- Clear localStorage and try again
- Check network tab in DevTools to see actual API response

### Issue 3: Blank page after navigating to Assignments
**Problem:** Component loads but fails to fetch
**Solution:**
- Check console for fetch error
- Verify backend `/tasks/assignments` endpoint exists
- Check if JWT token is being sent correctly

### Issue 4: 404 or CORS errors
**Problem:** API endpoint not found
**Solution:**
- Verify backend is running on port 5000
- Check Routes are properly registered
- Restart backend: `npm start`

## Commands to Run

### Terminal 1 - Backend:
```bash
cd backend
npm start
# Should print: Server running on port 5000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Should print: Local: http://localhost:5173
```

### Check Backend Health:
```bash
# In backend directory
node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGODB_URI);"
```

## Next Steps

1. **Clear everything**: Cache, localStorage, stop servers
2. **Restart Both**:
   ```bash
   # Terminal 1
   cd backend && npm start
   
   # Terminal 2
   cd frontend && npm run dev
   ```
3. **Login fresh** as admin
4. **Open Console (F12)** and share:
   - All console logs during login
   - Any error messages in red
   - The actual admin user object from localStorage

## What Admin Should See

### ✅ Correct Flow:
Login → Redirects to /admin → Dashboard shows → Sidebar visible → Click "Assignments" → Assignments page loads

### ❌ Wrong Flow Examples:
1. Login → Redirects to /admin/tasks/assignments directly
2. Click Assignments → Page stays blank or shows loading
3. Click Assignments → Redirects back to /admin dashboard

## Test the Backend API Directly

To verify the backend assignment endpoint works:
```bash
cd backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const Student = require('./models/Student');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  Assignment.find().populate('allocatedTo').then(a => {
    console.log('Assignments:', a.length);
    console.log('First:', a[0]);
    process.exit(0);
  });
});
"
```

---

**Share the console logs from step 3 and 4 so we can identify the exact issue!**
