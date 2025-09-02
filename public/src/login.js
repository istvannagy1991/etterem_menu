document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const loginSubmit = document.getElementById("loginSubmit");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const addBtn = document.getElementById("addBtn"); // ➕ gomb (etlap.html-en van)
  const loginModalEl = document.getElementById("loginModal");

  // állapot betöltése
  let loggedIn = localStorage.getItem("loggedIn") === "true";

  updateUI();

  // Bejelentkezés (modal submit)
  loginSubmit.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        loggedIn = true;
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        updateUI();
      } else {
        alert("Hibás felhasználónév vagy jelszó!");
      }
    } catch (err) {
      alert("Szerver hiba!");
      console.error(err);
    }
  });

  // Login/Kijelentkezés gomb
  loginBtn.addEventListener("click", (e) => {
    if (loggedIn) {
      e.preventDefault(); // ne nyissa meg a modalt
      loggedIn = false;
      localStorage.removeItem("loggedIn"); // korrektebb mint "false"-t tárolni
      updateUI();
    }
  });

  // Modal fókusz visszaadása (ARIA warning elkerüléséhez)
  if (loginModalEl) {
    loginModalEl.addEventListener("hidden.bs.modal", () => {
      if (loginBtn) loginBtn.focus();
    });
  }

  // UI frissítés
  function updateUI() {
    if (loggedIn) {
      loginBtn.textContent = "Kijelentkezés";
      loginBtn.removeAttribute("data-bs-toggle");
      loginBtn.removeAttribute("data-bs-target");

      // ➕ gomb megjelenítése
      if (addBtn) addBtn.style.display = "inline-block";

      // szerkesztés/törlés gombok mutatása
      document.querySelectorAll(".gombok").forEach(div => {
        div.style.display = "inline-flex";
      });

    } else {
      loginBtn.textContent = "Bejelentkezés";
      loginBtn.setAttribute("data-bs-toggle", "modal");
      loginBtn.setAttribute("data-bs-target", "#loginModal");

      // ➕ gomb elrejtése
      if (addBtn) addBtn.style.display = "none";

      // szerkesztés/törlés gombok elrejtése
      document.querySelectorAll(".gombok").forEach(div => {
        div.style.display = "none";
      });
    }

    // ha van renderEtelLista() függvényed az etlap.js-ben, érdemes itt újrahívni
    if (typeof renderEtelLista === "function") renderEtelLista();
  }
});
