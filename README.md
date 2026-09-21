# Karoke_Website
Setup Instructions
To make the system work, you must deploy the Google Apps Script backend and link it to your website.

IMPORTANT

Follow these exact steps to launch your backend database.

1. Create the Database
Go to Google Sheets and create a new blank spreadsheet. Name it Karaoke DB.
Do not rename the default sheet (or if you do, the script will auto-create the Users and Sessions sheets for you).
Ensure this Google Sheet is kept private (only accessible by your Google account).
2. Deploy Apps Script
In your new Google Sheet, click Extensions > Apps Script in the top menu.
Delete any default code in Code.gs.
Open the file I created for you locally at 
gas/Code.gs
 and copy ALL of its contents.
Paste the copied code into the Apps Script editor.
Click the Save icon (floppy disk).
3. Publish as a Web App
In the Apps Script editor, click the blue Deploy button at the top right, then select New deployment.
Click the gear icon next to "Select type" and choose Web app.
Fill out the form exactly as follows:
Description: Auth API v1
Execute as: Me (your_email@gmail.com)
Who has access: Anyone
Click Deploy.
Note: Google will prompt you to "Review permissions". Click it, choose your account, click "Advanced", and click "Go to Untitled project (unsafe)". Then click "Allow".
Once deployed, you will see a Web app URL (it ends in /exec). Copy this URL.
4. Link Frontend to Backend
Open 
js/auth.js
.
Look at line 6: const GOOGLE_APPS_SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
Replace "PASTE_YOUR_WEB_APP_URL_HERE" with the Web App URL you just copied. Keep the quotes around it.
Save auth.js.
Testing Your Application
TIP

After saving the URL in auth.js, open your website in your browser and run through these test scenarios to confirm everything works perfectly.

Test 1: Go to signup.html. Create a new user. You should see a success message and then redirect to login. Check your Google Sheet—the user should be added to the Users sheet with a hashed password!
Test 2: Try signing up with the exact same email. It should show an error.
Test 3: Go to index.html. Enter the email and password you just created. It should successfully log you in and redirect you to home.html.
Test 4: Try logging in with a wrong password. It should show "Invalid email or password".
Test 5: In an incognito window, try directly typing the URL for home.html. You should be instantly blocked and bounced back to index.html.
Test 6: While logged in, you should see the "Log Out" button at the top right of your screens instead of Log In / Sign Up.
Test 7: Click "Log Out". You will be safely returned to index.html and your session will be destroyed in the backend.