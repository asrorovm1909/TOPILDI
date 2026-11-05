
const SUPABASE_URL = "https://yclxqvxcrcgyglapvvzp.supabase.co";
const SUPABASE_KEY = "sb_publishable_ACqHlEBWGFozf7PQn1KHJg_d2q_jjll";
const BUCKET = "listing-images";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let currentLang = localStorage.getItem("topildi_lang") || "ru";
let listings = [];

const translations = {
  ru: {
    loading: "Загружаем объявления...",
    empty: "Пока объявлений нет.",
    lost: "Потерял",
    found: "Нашёл",
    delete: "Удалить",
    confirmDelete: "Удалить это объявление?",
    deleted: "Объявление удалено.",
    published: "Объявление опубликовано!",
    email: "Введите свой Gmail:",
    code: "Введите шестизначный код из письма:",
    sending: "Отправляем код...",
    sent: "Код отправлен! Проверьте почту и папку «Спам».",
    logging: "Проверяем код...",
    logged: "Вход выполнен!",
    cancelled: "Действие отменено.",
    error: "Ошибка: ",
    noResults: "Ничего не найдено.",
    photoError: "Фото должно быть не больше 5 МБ.",
    authError: "Не удалось выполнить вход.",
    categories: {
      "Документы": "Документы",
      "Электроника": "Электроника",
      "Одежда и сумки": "Одежда и сумки",
      "Ключи": "Ключи",
      "Животные": "Животные",
      "Другое": "Другое"
    }
  },
  uz: {
    loading: "E'lonlar yuklanmoqda...",
    empty: "Hozircha e'lonlar yo'q.",
    lost: "Yo'qotdim",
    found: "Topdim",
    delete: "O'chirish",
    confirmDelete: "Bu e'lon o'chirilsinmi?",
    deleted: "E'lon o'chirildi.",
    published: "E'lon joylandi!",
    email: "Gmail manzilingizni kiriting:",
    code: "Xatdagi 6 xonali kodni kiriting:",
    sending: "Kod yuborilmoqda...",
    sent: "Kod yuborildi! Pochtangizni va Spam papkasini tekshiring.",
    logging: "Kod tekshirilmoqda...",
    logged: "Tizimga kirdingiz!",
    cancelled: "Amal bekor qilindi.",
    error: "Xatolik: ",
    noResults: "Hech narsa topilmadi.",
    photoError: "Rasm hajmi 5 MB dan oshmasligi kerak.",
    authError: "Kirish amalga oshmadi.",
    categories: {
      "Документы": "Hujjatlar",
      "Электроника": "Elektronika",
      "Одежда и сумки": "Kiyim va sumkalar",
      "Ключи": "Kalitlar",
      "Животные": "Hayvonlar",
      "Другое": "Boshqa"
    }
  }
};

const t = (key) => translations[currentLang][key] || key;

function showMessage(message, isError = false) {
  const el = document.getElementById("formMessage");
  if (!el) return;

  el.textContent = message;
  el.style.color = isError ? "#ff5555" : "#22c55e";
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// Переключение языка
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("topildi_lang", lang);

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const value = translations[lang][key];

    if (value) el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const values = {
      ru: { searchPlaceholder: "Поиск по названию или месту..." },
      uz: { searchPlaceholder: "Nomi yoki joy bo'yicha qidirish..." }
    };

    if (values[lang][key]) {
      el.placeholder = values[lang][key];
    }
  });

  document.querySelectorAll(".lang").forEach(button => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });

  document.querySelectorAll(".type-option").forEach(option => {
    const input = option.querySelector("input");
    const label = option.querySelector("b");

    if (input && label) {
      label.textContent = t(input.value);
    }
  });

  renderListings();
}

document.querySelectorAll(".lang").forEach(button => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

// Обновление текущего пользователя
async function updateUser() {
  const { data, error } = await db.auth.getUser();

  if (error) {
    currentUser = null;
    return null;
  }

  currentUser = data.user || null;
  return currentUser;
}

// Вход по шестизначному коду Gmail
async function loginWithEmailCode() {
  await updateUser();

  if (currentUser) return currentUser;

  const email = prompt(t("email"));
  if (!email) throw new Error(t("cancelled"));

  const cleanEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Введите правильный адрес Gmail.");
  }

  showMessage(t("sending"));

  const { error: sendError } = await db.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true
    }
  });

  if (sendError) throw sendError;

  alert(t("sent"));

  const token = prompt(t("code"));
  if (!token) throw new Error(t("cancelled"));

  if (!/^\d{6}$/.test(token.trim())) {
    throw new Error("Код должен состоять из 6 цифр.");
  }

  showMessage(t("logging"));

  const { data, error } = await db.auth.verifyOtp({
    email: cleanEmail,
    token: token.trim(),
    type: "email"
  });

  if (error) throw error;

  currentUser = data.user;
  showMessage(t("logged"));

  return currentUser;
}

// Загрузка объявлений
async function loadListings() {
  const grid = document.getElementById("listingsGrid");
  grid.innerHTML = `<div class="loading">${t("loading")}</div>`;

  const { data, error } = await db
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    grid.textContent = "Ошибка загрузки: " + error.message;
    return;
  }

  listings = data || [];
  renderListings();
}

// Отображение объявлений
function renderListings() {
  const grid = document.getElementById("listingsGrid");
  if (!grid) return;

  const search = (
    document.getElementById("searchInput")?.value || ""
  ).toLowerCase().trim();

  const type = document.getElementById("typeFilter")?.value || "all";
  const category = document.getElementById("categoryFilter")?.value || "all";

  const filtered = listings.filter(item => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(search) ||
      (item.location || "").toLowerCase().includes(search);

    const matchesType = type === "all" || item.type === type;
    const matchesCategory = category === "all" || item.category === category;

    return matchesSearch && matchesType && matchesCategory;
  });

  document.getElementById("listingCount").textContent = filtered.length;

  if (!filtered.length) {
    grid.innerHTML = `<div class="loading">${listings.length ? t("noResults") : t("empty")}</div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const isOwner = currentUser && currentUser.id === item.user_id;
    const categoryName =
      translations[currentLang].categories[item.category] || item.category;

    const date = item.created_at
      ? new Date(item.created_at).toLocaleDateString(
          currentLang === "uz" ? "uz-UZ" : "ru-RU"
        )
      : "";

    return `
      <article class="listing-card">
        ${item.image_url ? `
          <img
            class="listing-image"
            src="${escapeHTML(item.image_url)}"
            alt="${escapeHTML(item.title)}"
            loading="lazy"
          >
        ` : ""}

        <div class="listing-content">
          <span class="listing-type ${item.type === "lost" ? "lost" : "found"}">
            ${t(item.type)}
          </span>

          <h3>${escapeHTML(item.title)}</h3>

          <p>${escapeHTML(item.description || "")}</p>

          <div class="listing-meta">
            <span>📂 ${escapeHTML(categoryName)}</span>
            <span>📍 ${escapeHTML(item.location)}</span>
            <span>📅 ${escapeHTML(date)}</span>
          </div>

          <div class="listing-contact">
            ${currentLang === "uz" ? "Aloqa:" : "Контакт:"}
            ${escapeHTML(item.contact)}
          </div>

          ${isOwner ? `
            <button
              class="delete-listing"
              data-delete-id="${escapeHTML(item.id)}"
              type="button"
            >${t("delete")}</button>
          ` : ""}
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-delete-id]").forEach(button => {
    button.addEventListener("click", () => {
      deleteListing(button.dataset.deleteId);
    });
  });
}

// Публикация объявления
document.getElementById("listingForm").addEventListener("submit", async event => {
  event.preventDefault();

  const button = document.getElementById("submitBtn");
  button.disabled = true;

  try {
    const user = await loginWithEmailCode();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title").trim();
    const category = formData.get("category");
    const description = formData.get("description").trim();
    const location = formData.get("location").trim();
    const contact = formData.get("contact").trim();
    const type = formData.get("type");
    const photo = formData.get("photo");

    if (!title || !category || !location || !contact) {
      throw new Error("Заполните обязательные поля.");
    }

    let imageUrl = null;

    if (photo && photo.size > 0) {
      if (photo.size > 5 * 1024 * 1024) {
        throw new Error(t("photoError"));
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
        throw new Error("Разрешены только JPG, PNG и WEBP.");
      }

      const extension = photo.name.split(".").pop().toLowerCase();
      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await db.storage
        .from(BUCKET)
        .upload(filePath, photo, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.type
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = db.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;
    }

    const { error } = await db.from("listings").insert({
      user_id: user.id,
      type,
      category,
      title,
      description,
      location,
      contact,
      image_url: imageUrl
    });

    if (error) throw error;

    form.reset();

    document.querySelectorAll(".type-option").forEach(option => {
      const input = option.querySelector("input");
      option.classList.toggle("selected", input.checked);
    });

    showMessage(t("published"));
    await loadListings();

  } catch (error) {
    console.error(error);
    showMessage(t("error") + error.message, true);
  } finally {
    button.disabled = false;
  }
});

// Удаление только своего объявления
async function deleteListing(id) {
  if (!confirm(t("confirmDelete"))) return;

  try {
    const user = await updateUser();

    if (!user) {
      throw new Error("Сначала войдите в аккаунт.");
    }

    const { error } = await db
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    showMessage(t("deleted"));
    await loadListings();

  } catch (error) {
    console.error(error);
    showMessage(t("error") + error.message, true);
  }
}

// Поиск и фильтры
document.getElementById("searchInput").addEventListener("input", renderListings);
document.getElementById("typeFilter").addEventListener("change", renderListings);
document.getElementById("categoryFilter").addEventListener("change", renderListings);

// Переключение типа объявления
document.querySelectorAll('input[name="type"]').forEach(input => {
  input.addEventListener("change", () => {
    document.querySelectorAll(".type-option").forEach(option => {
      option.classList.toggle(
        "selected",
        option.querySelector("input").checked
      );
    });
  });
});

// Запуск сайта
async function startApp() {
  setLanguage(currentLang);
  await updateUser();
  await loadListings();
}

startApp();
