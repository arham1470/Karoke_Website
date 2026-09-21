/**
 * Google Apps Script Backend for Karaoke Website Authentication
 */

function doPost(e) {
  // CORS Headers setup - use text/plain in frontend to avoid preflight OPTIONS
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    // Parse the incoming JSON request
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result = { success: false, message: "Unknown action" };
    
    // Get the active spreadsheet this script is bound to
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "signup") {
      result = handleSignup(ss, data);
    } else if (action === "login") {
      result = handleLogin(ss, data);
    } else if (action === "verifySession") {
      result = handleVerifySession(ss, data);
    } else if (action === "logout") {
      result = handleLogout(ss, data);
    }
    
    output.setContent(JSON.stringify(result));
    
  } catch (error) {
    output.setContent(JSON.stringify({
      success: false,
      message: "Server error: " + error.toString()
    }));
  }
  
  return output;
}

function handleSignup(ss, data) {
  let sheet = ss.getSheetByName("Users");
  if (!sheet) {
    // Auto-create Users sheet if it doesn't exist to prevent errors
    sheet = ss.insertSheet("Users");
    sheet.appendRow(["ID", "Name", "Email", "PasswordHash", "Status", "CreatedAt"]);
  }
  
  const email = (data.email || "").toString().toLowerCase().trim();
  const password = data.password;
  
  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }
  
  // Check if email already exists
  const dataRange = sheet.getDataRange().getValues();
  // Ensure we don't duplicate
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][2].toString().toLowerCase().trim() === email) {
      return { success: false, message: "Email already exists" };
    }
  }
  
  // Securely hash password
  const passwordHash = hashPassword(password);
  const id = Utilities.getUuid();
  const name = data.name || data.username || "User";
  const status = "active";
  const createdAt = new Date().toISOString();
  
  // Save to Google Sheets
  sheet.appendRow([id, name, email, passwordHash, status, createdAt]);
  
  return { success: true, message: "Signup successful" };
}

function handleLogin(ss, data) {
  const sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Database not found. Please sign up first." };
  
  const email = (data.email || "").toString().toLowerCase().trim();
  const password = data.password;
  const targetHash = hashPassword(password);
  
  const dataRange = sheet.getDataRange().getValues();
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][2].toString().toLowerCase().trim() === email) {
      // Verify password hash
      if (dataRange[i][3].toString() === targetHash) {
        // Check status
        if (dataRange[i][4].toString() !== "active") {
          return { success: false, message: "Account is not active" };
        }
        
        // Successful login, create session
        const sessionToken = Utilities.getUuid() + Utilities.getUuid();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session
        
        saveSession(ss, sessionToken, email, expiresAt.toISOString());
        
        return { 
          success: true, 
          token: sessionToken,
          user: {
            id: dataRange[i][0],
            name: dataRange[i][1],
            email: dataRange[i][2]
          }
        };
      }
    }
  }
  
  return { success: false, message: "Invalid email or password" };
}

function handleVerifySession(ss, data) {
  const token = data.token;
  if (!token) return { success: false, authenticated: false };
  
  const sessionSheet = getOrCreateSessionSheet(ss);
  const dataRange = sessionSheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0].toString() === token) {
      const expiresAt = new Date(dataRange[i][2]);
      if (new Date() < expiresAt) {
        return { success: true, authenticated: true };
      } else {
        return { success: false, authenticated: false, message: "Session expired" };
      }
    }
  }
  
  return { success: false, authenticated: false };
}

function handleLogout(ss, data) {
  const token = data.token;
  if (!token) return { success: true };
  
  const sessionSheet = getOrCreateSessionSheet(ss);
  const dataRange = sessionSheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0].toString() === token) {
      // Invalidate the session by setting expiry to a past date
      sessionSheet.getRange(i + 1, 3).setValue(new Date(0).toISOString());
      return { success: true };
    }
  }
  
  return { success: true };
}

function saveSession(ss, token, email, expiresAt) {
  const sessionSheet = getOrCreateSessionSheet(ss);
  sessionSheet.appendRow([token, email, expiresAt]);
}

function getOrCreateSessionSheet(ss) {
  let sheet = ss.getSheetByName("Sessions");
  if (!sheet) {
    sheet = ss.insertSheet("Sessions");
    sheet.appendRow(["Token", "UserEmail", "ExpiresAt"]);
  }
  return sheet;
}

function hashPassword(password) {
  // Uses SHA-256 for secure hashing
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
