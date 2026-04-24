const BASE_URL = "http://localhost:5001/api";

// 🔹 Helper to get token safely
const getToken = () => {
  return localStorage.getItem("token");
};

// 🔹 Common headers with auth
const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// 🔹 Suppliers
export const getSuppliers = async () => {
  try {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch suppliers");

    return await res.json();
  } catch (err) {
    console.error("Suppliers API error:", err);
    return [];
  }
};

// 🔹 Risk Data
export const getRiskData = async () => {
  try {
    const res = await fetch(`${BASE_URL}/risk`, {
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch risk data");

    return await res.json();
  } catch (err) {
    console.error("Risk API error:", err);
    return null;
  }
};

// 🔹 Analysis (FIXED 🔥)
export const runAnalysis = async (data: any[]) => {
  try {
    const res = await fetch(`${BASE_URL}/analysis`, {
      method: "POST",
      headers: getHeaders(), // ✅ includes JWT
      body: JSON.stringify({
        suppliers: data, // ✅ backend expects this format
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend error:", text);
      throw new Error("Analysis failed");
    }

    return await res.json();
  } catch (err) {
    console.error("Analysis API error:", err);
    return null;
  }
};