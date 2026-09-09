import app from "./src/index.js";
import { prisma } from "./src/db/client.js";
import http from "http";

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("==================================================");
  console.log("  MyAuthify Server - Integration Verification Test ");
  console.log("==================================================\n");

  await prisma.$connect();
  const server = app.listen(PORT);
  console.log(`Test server running on port ${PORT}...\n`);

  try {
    // Clean up test user if exists
    const testEmail = "test_developer@authify.com";
    await prisma.user.deleteMany({ where: { email: testEmail } });

    // 1. Health Check
    console.log("[Test 1]: Health Check (/api/v1/health)");
    const resHealth = await fetch(`${BASE_URL}/api/v1/health`);
    const dataHealth = await resHealth.json();
    console.log("Response:", resHealth.status, dataHealth);
    if (resHealth.status !== 200) throw new Error("Health check failed");
    console.log("✅ Passed!\n");

    // 2. SignUp
    console.log("[Test 2]: Sign Up User");
    const resSignUp = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "SecretPassword123!",
        name: "Test Developer",
      }),
    });
    const dataSignUp = await resSignUp.json();
    console.log("Response:", resSignUp.status, dataSignUp);
    if (resSignUp.status !== 201) throw new Error("SignUp failed");
    const sessionToken = dataSignUp.session.token;
    const verificationToken = dataSignUp.verificationToken;
    console.log("✅ Passed! Session Token:", sessionToken, "\n");

    // 3. Verify Email
    console.log("[Test 3]: Verify Email");
    const resVerify = await fetch(`${BASE_URL}/api/v1/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: verificationToken }),
    });
    const dataVerify = await resVerify.json();
    console.log("Response:", resVerify.status, dataVerify);
    if (resVerify.status !== 200) throw new Error("Email verification failed");
    console.log("✅ Passed!\n");

    // 4. Get Current User Session (/me) via Bearer token
    console.log("[Test 4]: Get Me (/api/v1/auth/me) with Session Token");
    const resMe = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const dataMe = await resMe.json();
    console.log("Response:", resMe.status, dataMe);
    if (resMe.status !== 200 || !dataMe.user) throw new Error("Get Me failed");
    console.log("✅ Passed! User:", dataMe.user.email, "Verified:", dataMe.user.emailVerified, "\n");

    // 5. Update Profile
    console.log("[Test 5]: Update Profile");
    const resProfile = await fetch(`${BASE_URL}/api/v1/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ name: "Updated Dev Name" }),
    });
    const dataProfile = await resProfile.json();
    console.log("Response:", resProfile.status, dataProfile);
    if (resProfile.status !== 200 || dataProfile.user.name !== "Updated Dev Name") {
      throw new Error("Update profile failed");
    }
    console.log("✅ Passed!\n");

    // 6. Create API Key
    console.log("[Test 6]: Generate API Key for External App Integration");
    const resApiKey = await fetch(`${BASE_URL}/api/v1/auth/api-keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ name: "Resume Demo App" }),
    });
    const dataApiKey = await resApiKey.json();
    console.log("Response:", resApiKey.status, dataApiKey);
    if (resApiKey.status !== 201) throw new Error("API Key generation failed");
    const generatedRawApiKey = dataApiKey.apiKey.apiKey;
    console.log("✅ Passed! Generated Raw API Key:", generatedRawApiKey, "\n");

    // 7. Authenticate using x-api-key Header
    console.log("[Test 7]: Authenticate via x-api-key Header");
    const resApiKeyAuth = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { "x-api-key": generatedRawApiKey },
    });
    const dataApiKeyAuth = await resApiKeyAuth.json();
    console.log("Response:", resApiKeyAuth.status, dataApiKeyAuth);
    if (resApiKeyAuth.status !== 200 || !dataApiKeyAuth.apiKey) {
      throw new Error("API Key authentication failed");
    }
    console.log("✅ Passed!\n");

    // 8. Forgot Password & Reset Password
    console.log("[Test 8]: Forgot Password");
    const resForgot = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const dataForgot = await resForgot.json();
    console.log("Response:", resForgot.status, dataForgot);
    const resetToken = dataForgot.resetToken;

    console.log("[Test 9]: Reset Password with Token");
    const resReset = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        newPassword: "BrandNewSecretPassword123!",
      }),
    });
    const dataReset = await resReset.json();
    console.log("Response:", resReset.status, dataReset);
    if (resReset.status !== 200) throw new Error("Reset password failed");
    console.log("✅ Passed!\n");

    // 9. Sign In with New Password
    console.log("[Test 10]: Sign In with New Password");
    const resSignIn = await fetch(`${BASE_URL}/api/v1/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "BrandNewSecretPassword123!",
      }),
    });
    const dataSignIn = await resSignIn.json();
    console.log("Response:", resSignIn.status, dataSignIn);
    if (resSignIn.status !== 200) throw new Error("Sign In with new password failed");
    const newSessionToken = dataSignIn.session.token;
    console.log("✅ Passed!\n");

    // 10. List Active Sessions
    console.log("[Test 11]: List Active Sessions");
    const resSessions = await fetch(`${BASE_URL}/api/v1/auth/sessions`, {
      headers: { Authorization: `Bearer ${newSessionToken}` },
    });
    const dataSessions = await resSessions.json();
    console.log("Response:", resSessions.status, dataSessions);
    if (resSessions.status !== 200 || !dataSessions.sessions) {
      throw new Error("List sessions failed");
    }
    console.log("✅ Passed!\n");

    // 11. Sign Out
    console.log("[Test 12]: Sign Out");
    const resSignOut = await fetch(`${BASE_URL}/api/v1/auth/signout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${newSessionToken}` },
    });
    const dataSignOut = await resSignOut.json();
    console.log("Response:", resSignOut.status, dataSignOut);
    if (resSignOut.status !== 200) throw new Error("Sign Out failed");

    // Verify Session Revoked
    const resVerifyRevoked = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${newSessionToken}` },
    });
    console.log("Me Response after Sign Out (expect 401):", resVerifyRevoked.status);
    if (resVerifyRevoked.status !== 401) throw new Error("Session was not revoked properly");
    console.log("✅ Passed!\n");

    // Clean up test record
    await prisma.user.deleteMany({ where: { email: testEmail } });

    console.log("==================================================");
    console.log(" 🎉 ALL BACKEND INTEGRATION TESTS PASSED 100%! 🎉");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ Test Failed:", err);
  } finally {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();
