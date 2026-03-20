import axios from "axios";

export const logout = async () => {
  try {
    await axios.delete("/api/auth/google", {
      withCredentials: true
    });
    
    // Clear any client-side auth state
    localStorage.removeItem("user");
    
    // Redirect to login
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    // Force redirect even if API call fails
    window.location.href = "/login";
  }
};