// -------------------------------------------------------------
// src/script.js
// Étellista kezelése (kliens oldali logika)
//
// Funkciók:
// - Menü betöltése a szerverről (/menu GET)
// - Lista kirajzolása a DOM-ba
// - Új étel hozzáadása (szerkesztés modal új módban)
// - Meglévő étel szerkesztése (szerkesztés modal szerkesztés módban)
// - Törlés
// - Mozgatás fel/le
// - Mentés a szerver felé (POST /menu)
//
// Fontos: a szerkesztéshez, törléshez és hozzáadáshoz
// csak akkor férhet hozzá a felhasználó, ha `localStorage.loggedIn === "true"`
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // HTML elemek
  // -------------------------
  const etelLista = document.getElementById("etelLista");   // UL lista az ételeknek
  const addBtn = document.getElementById("addBtn");         // ➕ gomb

  // Szerkesztés modal elemei (hozzáadáshoz is ezt használjuk)
  const editNevInput = document.getElementById("editNev");      
  const editArInput = document.getElementById("editAr");
  const editSaveBtn = document.getElementById("editSaveBtn");
  const editModalEl = document.getElementById("editModal");
  const editModal = new bootstrap.Modal(editModalEl);

  // -------------------------
  // Állapot
  // -------------------------
  let etelek = [];          // Ételek listája (JSON-ból betöltve)
  let editingIndex = null;  // Ha null → új étel, ha szám → meglévő szerkesztése

  // -------------------------
  // Menü betöltése szerverről
  // -------------------------
  async function loadMenuFromServer() {
    try {
      const res = await fetch("/menu");
      if (!res.ok) throw new Error(`HTTP hiba: ${res.status}`);
      etelek = await res.json();
      renderEtelLista();
    } catch (err) {
      console.error("Hiba a menü betöltésekor:", err);
    }
  }

  // -------------------------
  // Lista kirajzolása a DOM-ba
  // -------------------------
  function renderEtelLista() {
    etelLista.innerHTML = ""; 

    const isLoggedIn = localStorage.getItem("loggedIn") === "true";

    etelek.forEach((etel, index) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex align-items-center bg-transparent text-white";

      // Név
      const nameSpan = document.createElement("span");
      nameSpan.className = "nev";
      nameSpan.textContent = etel.nev;

      // Ár
      const priceSpan = document.createElement("span");
      priceSpan.className = "ar";
      priceSpan.textContent = `${etel.ar} Hrn`;

      // Gombok konténer
      const gombokDiv = document.createElement("div");
      gombokDiv.className = "gombok";

      if (isLoggedIn) {
        // Fel/Le mozgatás
        const upBtn = makeButton("⬆", "btn btn-sm btn-secondary me-1");
        const downBtn = makeButton("⬇", "btn btn-sm btn-secondary me-1");

        upBtn.addEventListener("click", () => moveUp(index));
        downBtn.addEventListener("click", () => moveDown(index));

        // Szerkesztés
        const editBtn = makeButton("✏️", "btn btn-sm btn-warning me-1");
        editBtn.addEventListener("click", () => openEditModal(index));

        // Törlés
        const deleteBtn = makeButton("🗑️", "btn btn-sm btn-danger");
        deleteBtn.addEventListener("click", () => deleteItem(index));

        gombokDiv.append(upBtn, downBtn, editBtn, deleteBtn);
      }

      li.append(nameSpan, priceSpan, gombokDiv);
      etelLista.appendChild(li);
    });
  }

  // -------------------------
  // Segédfüggvény: gomb készítése
  // -------------------------
  function makeButton(text, className) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.textContent = text;
    return b;
  }

  // -------------------------
  // Új étel hozzáadása
  // -------------------------
  function addItem(nev, ar) {
    etelek.push({ nev, ar: parseInt(ar, 10) });
    saveMenuToServer();
    renderEtelLista();
  }

  // -------------------------
  // Meglévő étel módosítása
  // -------------------------
  function editItem(index, nev, ar) {
    etelek[index] = { nev, ar: parseInt(ar, 10) };
    saveMenuToServer();
    renderEtelLista();
  }

  // -------------------------
  // Szerkesztés modal megnyitása
  // -------------------------
  function openEditModal(index = null) {
    editingIndex = index;

    if (index === null) {
      // Új étel hozzáadás
      editNevInput.value = "";
      editArInput.value = "";
    } else {
      // Meglévő szerkesztése
      editNevInput.value = etelek[index].nev;
      editArInput.value = etelek[index].ar;
    }

    editModal.show();
  }

  // -------------------------
  // Szerkesztés modal → Mentés gomb
  // -------------------------
  function saveEditedItem() {
    const nev = editNevInput.value.trim();
    const ar = parseInt(editArInput.value.trim(), 10);

    if (!nev || isNaN(ar)) {
      alert("Adj meg érvényes nevet és árat (szám).");
      return;
    }

    if (editingIndex === null) {
      addItem(nev, ar);
    } else {
      editItem(editingIndex, nev, ar);
      editingIndex = null;
    }

    editModal.hide();
  }

  // -------------------------
  // Étel törlése
  // -------------------------
  function deleteItem(index) {
    if (!confirm(`Biztosan törölni akarod: ${etelek[index].nev}?`)) return;
    etelek.splice(index, 1);
    saveMenuToServer();
    renderEtelLista();
  }

  // -------------------------
  // Mozgatás felfelé
  // -------------------------
  function moveUp(index) {
    if (index <= 0) return;
    [etelek[index - 1], etelek[index]] = [etelek[index], etelek[index - 1]];
    saveMenuToServer();
    renderEtelLista();
  }

  // -------------------------
  // Mozgatás lefelé
  // -------------------------
  function moveDown(index) {
    if (index >= etelek.length - 1) return;
    [etelek[index + 1], etelek[index]] = [etelek[index], etelek[index + 1]];
    saveMenuToServer();
    renderEtelLista();
  }

  // -------------------------
  // Mentés a szerverre (POST /menu)
  // -------------------------
  async function saveMenuToServer() {
    try {
      const res = await fetch("/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        username: localStorage.getItem("username"),
        password: localStorage.getItem("password"),
        etelek
      })
      });

      if (!res.ok) {
        throw new Error(`Hiba mentéskor: ${res.status}`);
      }
    } catch (err) {
      console.error("Hiba mentéskor:", err);
    }
  }

  // -------------------------
  // Események
  // -------------------------
  if (editSaveBtn) {
    editSaveBtn.addEventListener("click", saveEditedItem);
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => openEditModal(null)); 
    // ➕ gomb új ételhez
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    addBtn.style.display = isLoggedIn ? "inline-block" : "none";
  }

  // -------------------------
  // Induláskor menü betöltése
  // -------------------------
  loadMenuFromServer();
});
