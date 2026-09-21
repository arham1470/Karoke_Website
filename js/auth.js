/**
 * Authentication Client for Karaoke Website
 */

// IMPORTANT: Paste your deployed Google Apps Script Web App URL here
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5vDt-wIv_SGlFnXkSLt7yK64eC7QhrC586mrJ_MwnsdEOwB2dyuUNJOQOaim-D8Sa/exec";

window.auth = {
    login: async function(email, password) {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain" // text/plain prevents CORS preflight errors in Google Apps Script
                },
                body: JSON.stringify({
                    action: "login",
                    email: email,
                    password: password
                })
            });
            const result = await response.json();
            if (result.success && result.token) {
                localStorage.setItem("auth_token", result.token);
                localStorage.setItem("auth_user", JSON.stringify(result.user));
            }
            return result;
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Network error. Please ensure the Apps Script URL is correct." };
        }
    },

    signup: async function(userData) {
        try {
            userData.action = "signup";
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error("Signup error:", error);
            return { success: false, message: "Network error. Please try again." };
        }
    },

    verifySession: async function(redirectIfInvalid = true) {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            if (redirectIfInvalid) {
                window.location.href = "index.html";
            }
            return false;
        }

        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify({
                    action: "verifySession",
                    token: token
                })
            });
            const result = await response.json();
            if (!result.success || !result.authenticated) {
                // Invalid or expired token
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
                if (redirectIfInvalid) {
                    window.location.href = "index.html";
                }
                return false;
            }
            return true;
        } catch (error) {
            console.error("Verify session error:", error);
            // To be secure, on failure we block access.
            if (redirectIfInvalid) window.location.href = "index.html";
            return false;
        }
    },

    logout: async function(event) {
        if(event) event.preventDefault();
        
        const token = localStorage.getItem("auth_token");
        if (token) {
            try {
                await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain"
                    },
                    body: JSON.stringify({
                        action: "logout",
                        token: token
                    })
                });
            } catch (error) {
                console.error("Logout error:", error);
            }
        }
        
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "index.html";
    },

    updateTopBannerUI: function() {
        // Find the login and signup buttons and replace with Profile Dropdown
        const headerButtons = document.querySelector('.header-buttons');
        if (headerButtons) {
            const token = localStorage.getItem("auth_token");
            const userStr = localStorage.getItem("auth_user");
            
            if (token) {
                let initial = "U";
                let userName = "User";
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        if (user.name) {
                            userName = user.name;
                            initial = user.name.charAt(0).toUpperCase();
                        }
                    } catch(e){}
                }

                // Inject CSS for dropdown if not exists
                if (!document.getElementById('profile-dropdown-style')) {
                    const style = document.createElement('style');
                    style.id = 'profile-dropdown-style';
                    style.innerHTML = `
                        .top-banner { position: relative; z-index: 2000; }
                        .profile-dropdown-container { position: relative; display: inline-block; margin-left: 10px; }
                        .profile-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #00d2ff, #1b5394); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; font-size: 18px; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: transform 0.2s; }
                        .profile-circle:hover { transform: scale(1.05); }
                        .profile-dropdown-menu { position: absolute; right: 0; top: 50px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border-radius: 8px; overflow: hidden; z-index: 1000; min-width: 160px; opacity: 0; visibility: hidden; transition: all 0.3s ease; transform: translateY(-10px); }
                        .profile-dropdown-menu.show { opacity: 1; visibility: visible; transform: translateY(0); }
                        .profile-dropdown-item { display: block; padding: 12px 16px; color: #333; text-decoration: none; border-bottom: 1px solid #eee; transition: background 0.2s; font-size: 14px; text-align: left; }
                        .profile-dropdown-item:hover { background: #f8f9fa; }
                        .profile-dropdown-item:last-child { border-bottom: none; }
                        .profile-welcome { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 13px; color: #666; background: #fafafa; margin: 0; text-align: left; }
                    `;
                    document.head.appendChild(style);
                }

                headerButtons.innerHTML = `
                    <div class="profile-dropdown-container">
                        <div class="profile-circle" onclick="document.getElementById('profile-dropdown-menu').classList.toggle('show')">
                            ${initial}
                        </div>
                        <div id="profile-dropdown-menu" class="profile-dropdown-menu">
                            <p class="profile-welcome">Hi, <b>${userName}</b></p>
                            <a href="#" class="profile-dropdown-item" onclick="window.auth.logout(event)">
                                <i class="fas fa-sign-out-alt" style="margin-right: 8px; color: #e74c3c;"></i> Log Out
                            </a>
                        </div>
                    </div>
                `;

                // Close dropdown when clicking outside
                document.addEventListener('click', function(e) {
                    const container = document.querySelector('.profile-dropdown-container');
                    if (container && !container.contains(e.target)) {
                        const menu = document.getElementById('profile-dropdown-menu');
                        if (menu) menu.classList.remove('show');
                    }
                });
            }
        }
    }
};
