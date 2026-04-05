// setup.js

async function runSetup() {
  try {
    const res = await fetch("http://localhost:3000/api/auth/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: "your-SETUP_SECRET",
        email: "sahu.aakash1008@email.com",
        password: "iamAakash@10",
        name: "Aakash",
      }),
    });

    const data = await res.json();
    console.log("✅ Response:", data);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

runSetup();