
/**
 * ASC Foundation - Cloudflare Worker Backend
 * Handles API Chat, Contact Form Submissions, and Health Checks.
 */

const ALLOWED_ORIGIN = "*"; // Sesuaikan dengan domain kustom Anda, contoh: "https://ascfoundation.org"

// Security Headers Response Helper
function createJsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
  });
}

// Sanitasi string input dasar untuk mencegah Injection / XSS
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  }).trim();
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Handle OPTIONS Preflight request
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // Routing
    if (url.pathname === "/health" && method === "GET") {
      return createJsonResponse({ status: "ok", timestamp: new Date().toISOString() });
    }

    // API Contact Form Submission
    if (url.pathname === "/api/contact" && method === "POST") {
      try {
        const body = await request.json();
        const name = sanitizeInput(body.name);
        const email = sanitizeInput(body.email);
        const subject = sanitizeInput(body.subject);
        const message = sanitizeInput(body.message);

        if (!name || !email || !message) {
          return createJsonResponse({ error: "Required fields missing." }, 400);
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return createJsonResponse({ error: "Invalid email format." }, 400);
        }

        // Integrasi Email / Database bisa ditaruh di sini
        // Log pesan secara aman (Simulasi proses pengiriman)
        console.log(`[Contact Form] From: ${name} (${email}), Subject: ${subject}`);

        return createJsonResponse({ 
          success: true, 
          message: "Thank you for contacting ASC Foundation. Your message has been received." 
        });
      } catch (err) {
        return createJsonResponse({ error: "Invalid JSON request payload." }, 400);
      }
    }

    // API AI Chatbot Endpoint
    if (url.pathname === "/api/chat" && method === "POST") {
      try {
        const body = await request.json();
        const userPrompt = sanitizeInput(body.prompt);

        if (!userPrompt) {
          return createJsonResponse({ error: "Prompt cannot be empty." }, 400);
        }

        // Cloudflare Workers AI Provider / External Provider Support
        const provider = env.AI_PROVIDER || "cloudflare";
        let aiResponseText = "";

        if (provider === "cloudflare" && env.AI) {
          // Cloudflare Workers AI (LLaMA-3 / Mistral)
          const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
              { role: 'system', content: 'You are the official AI Assistant for ASC Foundation (a global humanitarian organization). Be helpful, empathetic, concise, and polite.' },
              { role: 'user', content: userPrompt }
            ]
          });
          aiResponseText = response.response;
        } else {
          // Fallback response jika AI Key belum diset
          aiResponseText = "Thank you for reaching out to ASC Foundation. Our team is dedicated to global impact through technology, education, and humanitarian aid. How can we assist your mission today?";
        }

        return createJsonResponse({ reply: aiResponseText });
      } catch (err) {
        return createJsonResponse({ error: "Error processing AI request." }, 500);
      }
    }

    return createJsonResponse({ error: "Endpoint not found." }, 404);
  }
};
