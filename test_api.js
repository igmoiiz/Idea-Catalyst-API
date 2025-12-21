const API_URL = "http://localhost:5000/api";

const testAuth = async () => {
  try {
    console.log("Testing Health Check...");
    const healthRes = await fetch(`${API_URL}/auth/health`);
    const healthData = await healthRes.json();
    console.log("Health Check:", healthData);

    console.log("Testing Registration...");
    const email = `test${Date.now()}@example.com`;
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email,
        password: "Password123",
        role: "Consumer",
      }),
    });
    const registerData = await registerRes.json();
    console.log("Registration Success:", registerData.success);

    if (registerData.success) {
        console.log("User ID:", registerData.userId);
    } else {
        console.log("Registration Failed:", registerData);
    }

  } catch (error) {
    console.error("Auth Test Error:", error);
  }
};

testAuth();
