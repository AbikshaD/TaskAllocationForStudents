# Student Login Troubleshooting Guide

## What Works ✅
- Backend student login endpoint is **fully functional**
- Database has correct student and user accounts
- Passwords are correctly hashed and can be verified
- Test confirmed: StudentID `STU0001` with password `STU0001@123` **logs in successfully** on backend

## What's Added for Debugging 🔍
Enhanced logging has been added to trace the exact issue:

### Backend Logging (authController.js)
- Student login now logs every step of the authentication process
- Check terminal where backend is running for these logs:
  ```
  🔐 Student login attempt - studentId: STU0001
  👤 User found: aaa (stu0001@college.edu)
  🔑 Password match: true
  ✅ Student login successful: STU0001
  ```

### Frontend Logging (Context & Login Component)
- AuthContext now logs when `studentLogin()` is called and when user state updates
- Login component logs form submission and navigation
- Check browser console (Press F12) for:
  ```
  Student login attempt: STU0001
  Login response received: {...}
  User and token stored in localStorage
  User state updated in context
  Login useEffect triggered - user state: {role: 'student', ...}
  Navigating to dashboard: /student
  ```

## Steps to Test

### 1. **Restart the Backend** (to load new logging)
```bash
cd backend
npm start
```
Wait for: `Server running on port 5000`

### 2. **Try Student Login**
- Open frontend: http://localhost:5173
- Click "Student" tab on login form
- Enter credentials:
  - Student ID: `STU0001`
  - Password: `STU0001@123`
- Click "Sign In"

### 3. **Check Console Logs**
- **Browser Console (F12 -> Console tab):**
  - Look for login attempt and navigation logs
  - Check for any error messages in red
  
- **Terminal (where `npm start` is running):**
  - Look for backend student login logs
  - Check for any error messages

## Possible Issues & Solutions

### Issue 1: Backend returns 401 "Invalid student ID or password"
**What to check:**
- Is the correct studentId being sent? (should match what's in database)
- Is the password exactly: `{studentId}@123` ?
  - For STU0001 → `STU0001@123`
  - NOT `stu0001@123` or `STUtesting@123`

### Issue 2: Frontend shows error but backend logs don't appear
**What to check:**
- Is backend port 5000 accessible?
- Check Vite proxy configuration
- Try manually testing API:
  ```bash
  # In backend directory
  node test-login.js
  ```

### Issue 3: Login succeeds but doesn't navigate to dashboard
**What to check:**
- Does browser console show "Navigating to dashboard: /student"?
- Are there any errors after that point?
- Check localStorage in browser:
  - Open DevTools → Application → LocalStorage → http://localhost:5173
  - Should have keys: `token` and `user`
  - `user` should contain `role: "student"`

### Issue 4: Navigates to /student but shows blank page
**What to check:**
- StudentLayout component should render
- Check browser console for errors from StudentDashboard component
- Verify Sidebar component loads correctly

## Quick Test Command

Run this to verify backend login still works:
```bash
cd backend
node test-login.js
```

Should output:
```
✅ Connected
📋 Students in database:
1. ID: STU0001 | Name: aaa | Email: stu0001@college.edu
✅ User found: aaa
✅ Password match: true
✨ Test complete
```

## Next Steps

1. Restart both backend and frontend
2. Attempt student login with debugging logs enabled
3. Share the **browser console logs** and **backend terminal logs** showing what happens during login
4. This will help identify exactly where the issue is occurring
