export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the API URL from environment variables
    const apiUrl =
      "https://cts.myvi.in:8443/Cpaas/api/clicktocall/initiate-call";

    // Extract request body
    let requestBody = req.body;

    // If request body is a string, parse it (Vercel might auto-parse JSON)
    if (typeof requestBody === "string") {
      try {
        requestBody = JSON.parse(requestBody);
      } catch {
        // If it's not JSON, it might be URL encoded
        requestBody = Object.fromEntries(new URLSearchParams(requestBody));
      }
    }

    // Convert the body to URL encoded format
    const formData = new URLSearchParams();
    for (const key in requestBody) {
      formData.append(key, requestBody[key]);
    }

    // Set up headers
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // Add authorization if present
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    // Make the API call
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData.toString(),
    });

    // Get the response data
    const data = await response.json();

    // Return the response with the same status code
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      error: "Error proxying request",
      details: error.message,
    });
  }
}
