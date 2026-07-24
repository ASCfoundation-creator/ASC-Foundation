
/**
 * ASC Foundation - Client Main Script
 */

// Global Configuration Variables
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/xxxxxxxx"; // Ganti dengan link Stripe asli Anda

document.addEventListener("DOMContentLoaded", () => {
  initDonationButtons();
  initAIChat();
  initSmoothScroll();
});

// Redirect seluruh tombol donasi ke Stripe
function initDonationButtons() {
  const donateButtons = document.querySelectorAll('a[href="#donate"], .btn-donate');
  donateButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(STRIPE_PAYMENT_LINK, "_blank", "noopener,noreferrer");
    });
  });
}

// Inisialisasi Widget AI Chatbot
function initAIChat() {
  const toggleBtn = document.getElementById("aiToggle");
  const aiBox = document.getElementById("aiBox");
  const sendBtn = document.getElementById("aiSend");
  const inputEl = document.getElementById("aiInput");
  const msgContainer = document.getElementById("aiMessages");

  if (!toggleBtn || !aiBox) return;

  toggleBtn.addEventListener("click", () => {
    aiBox.classList.toggle("active");
  });

  async function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    // Append User Message
    appendMessage(text, "user");
    inputEl.value = "";

    // Append Loading State
    const loadingMsg = appendMessage("Thinking...", "bot");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text })
      });

      const data = await response.json();
      loadingMsg.textContent = data.reply || "Thank you for contacting ASC Foundation.";
    } catch (err) {
      loadingMsg.textContent = "Sorry, unable to connect to AI server right now.";
    }
  }

  sendBtn.addEventListener("click", handleSend);
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });

  function appendMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return msg;
  }
}

// Smooth Scrolling
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === "#donate") return; // Skip donasi
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
  ggg GT
