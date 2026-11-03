
const SUPABASE_URL = "https://mkvagtbnrfvqpaungvmd.supabase.co";
const SUPABASE_KEY = "sb_publishable_6qNz77uWZjyu5VnVHufZtQ_Fj6uHJgA";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "listing-images";

const translations = {
  ru: {
    navListings:"Объявления", navHow:"Как это работает", postBtn:"+ Подать объявление",
    eyebrow:"СООБЩЕСТВО ПОМОЩИ", heroTitle:"Потерял? Найдём.", 
    heroText:"Место, где потерянные вещи возвращаются к своим владельцам. Размести объявление — возможно, кто-то уже нашёл твою вещь.",
    seeListings:"Смотреть объявления", createPost:"Разместить бесплатно", noAccount:"Без регистрации и входа",
    heroBadge:"Вещи находят дорогу домой", community:"Помогаем друг другу", keys:"Ключи", bag:"Рюкзак",
    statBrand:"платформа находок", statFree:"Бесплатные объявления", statOpen:"Доступна каждому",
    postEyebrow:"ПОМОГИ ВЕЩИ НАЙТИСЬ", postTitle:"Подать объявление", freeLabel:"БЕСПЛАТНО",
    lost:"Потерял", found:"Нашёл", fieldTitle:"Название вещи *", fieldCategory:"Категория *",
    choose:"Выберите категорию", fieldDescription:"Описание", fieldLocation:"Место *",
    fieldContact:"Контакт для связи *", fieldPhoto:"Фото (необязательно)", photoHint:"До 5 МБ.",
    publish:"Опубликовать объявление →", feedEyebrow:"СВЕЖИЕ ИСТОРИИ", feedTitle:"Объявления",
    searchPlaceholder:"Поиск по названию или месту...", allTypes:"Все объявления",
    lostOnly:"Потерянные", foundOnly:"Найденные", allCategories:"Все категории",
    catDocs:"Документы", catTech:"Электроника", catClothes:"Одежда и сумки",
    catKeys:"Ключи", catPets:"Животные", catOther:"Другое",
    loading:"Загружаем объявления...", howTitle:"Добрые дела начинаются с простого шага.",
    step1Title:"Опубликуй", step1Text:"Расскажи, что потерял или нашёл.",
    step2Title:"Найди", step2Text:"Ищи объявления или жди отклика.",
    step3Title:"Верни", step3Text:"Помоги вещи вернуться домой.",
    footerText:"Каждая находка — чья-то радость.", lostBadge:"ПОТЕРЯНО",
    foundBadge:"НАЙДЕНО", contact:"Связаться", noResults:"Объявлений пока нет. Будь первым!",
    uploading:"Публикуем объявление...", published:"Объявление опубликовано!",
    required:"Заполни все обязательные поля.", uploadError:"Не удалось загрузить фото.",
    genericError:"Не удалось опубликовать. Проверь настройки Supabase.",
    loadError:"Не удалось загрузить объявления. Проверь настройки базы данных.",
    photoTooBig:"Фото должно быть не больше 5 МБ."
  },
  uz: {
    navListings:"E'lonlar", navHow:"Qanday ishlaydi", postBtn:"+ E'lon berish",
    eyebrow:"YORDAM HAMJAMIYATI", heroTitle:"Yo‘qotdingizmi? Topamiz.",
    heroText:"Yo‘qolgan buyumlar egasiga qaytadigan joy. E'lon joylang — balki kimdir buyumingizni topgandir.",
    seeListings:"E'lonlarni ko‘rish", createPost:"Bepul e'lon berish", noAccount:"Ro‘yxatdan o‘tish shart emas",
    heroBadge:"Buyumlar uyiga qaytadi", community:"Bir-birimizga yordam beramiz", keys:"Kalitlar", bag:"Ryukzak",
    statBrand:"topilmalar platformasi", statFree:"Bepul e'lonlar", statOpen:"Hamma uchun ochiq",
    postEyebrow:"BUYUMNI TOPISHGA YORDAM BERING", postTitle:"E'lon berish", freeLabel:"BEPUL",
    lost:"Yo‘qotdim", found:"Topdim", fieldTitle:"Buyum nomi *", fieldCategory:"Kategoriya *",
    choose:"Kategoriyani tanlang", fieldDescription:"Tavsif", fieldLocation:"Joylashuv *",
    fieldContact:"Aloqa uchun kontakt *", fieldPhoto:"Rasm (ixtiyoriy)", photoHint:"5 MB gacha.",
    publish:"E'lonni joylash →", feedEyebrow:"YANGI E'LONLAR", feedTitle:"E'lonlar",
    searchPlaceholder:"Nomi yoki joylashuvi bo‘yicha qidirish...", allTypes:"Barcha e'lonlar",
    lostOnly:"Yo‘qolgan", foundOnly:"Topilgan", allCategories:"Barcha kategoriyalar",
    catDocs:"Hujjatlar", catTech:"Elektronika", catClothes:"Kiyim va sumkalar",
    catKeys:"Kalitlar", catPets:"Hayvonlar", catOther:"Boshqa",
    loading:"E'lonlar yuklanmoqda...", howTitle:"Yaxshilik oddiy qadamlardan boshlanadi.",
    step1Title:"Joylang", step1Text:"Nimani yo‘qotganingiz yoki topganingizni yozing.",
    step2Title:"Toping", step2Text:"E'lonlarni qidiring yoki javob kuting.",
    step3Title:"Qaytaring", step3Text:"Buyumni egasiga qaytarishga yordam bering.",
    footerText:"Har bir topilma — kimningdir quvonchi.", lostBadge:"YO‘QOLGAN",
    foundBadge:"TOPILGAN", contact:"Bog‘lanish", noResults:"Hozircha e'lonlar yo‘q. Birinchi bo‘ling!",
    uploading:"E'lon joylanmoqda...", published:"E'lon joylandi!",
    required:"Majburiy maydonlarni to‘ldiring.", uploadError:"Rasm yuklanmadi.",
    genericError:"Joylab bo‘lmadi. Supabase sozlamalarini tekshiring.",
    loadError:"E'lonlarni yuklab bo‘lmadi. Baza sozlamalarini tekshiring.",
    photoTooBig:"Rasm hajmi 5 MB dan oshmasligi kerak."
  }
};

let lang = localStorage.getItem("topildi_lang") || "ru";
let listings = [];

function t(key) {
  return translations[lang][key] || translations.ru[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key === "heroTitle") {
      const parts = lang === "ru"
        ? ['Потерял? ', 'Найдём.']
        : ['Yo‘qotdingizmi? ', 'Topamiz.'];
      el.innerHTML = `${parts[0]}<em>${parts[1]}</em>`;
    } else {
      el.textContent = t(key);
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll(".lang").forEach(b => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
  renderListings();
}

document.querySelectorAll(".lang").forEach(button => {
  button.addEventListener("click", () => {
    lang = button.dataset.lang;
    localStorage.setItem("topildi_lang", lang);
    applyLanguage();
  });
});

document.querySelectorAll(".type-option input").forEach(input => {
  input.addEventListener("change", () => {
    document.querySelectorAll(".type-option").forEach(label => {
      label.classList.toggle("selected", label.querySelector("input").checked);
    });
  });
});

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}

function contactLink(value) {
  const raw = String(value || "").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const phone = raw.replace(/[^\d+]/g, "");
  if (/^\+?\d{7,}$/.test(phone)) return "https://wa.me/" + phone.replace(/\D/g, "");
  if (/^@?[a-zA-Z0-9_]{5,}$/.test(raw)) return "https://t.me/" + raw.replace(/^@/, "");
  return "";
}

function categoryName(category) {
  const map = {
    "Документы":"catDocs", "Электроника":"catTech",
    "Одежда и сумки":"catClothes", "Ключи":"catKeys",
    "Животные":"catPets", "Другое":"catOther"
  };
  return t(map[category] || "catOther");
}

function renderListings() {
  const grid = document.getElementById("listingsGrid");
  const query = (document.getElementById("searchInput").value || "").toLowerCase().trim();
  const type = document.getElementById("typeFilter").value;
  const category = document.getElementById("categoryFilter").value;

  const filtered = listings.filter(item => {
    const text = [item.title, item.description, item.location, item.category].join(" ").toLowerCase();
    return (!query || text.includes(query)) &&
      (type === "all" || item.type === type) &&
      (category === "all" || item.category === category);
  });

  document.getElementById("listingCount").textContent = filtered.length;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty">${t("noResults")}</div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const isFound = item.type === "found";
    const image = item.image_url
      ? `<img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.title)}" loading="lazy">`
      : "<span>⌕</span>";
    const link = contactLink(item.contact);
    const contact = link
      ? `<a class="listing-contact" href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer">${t("contact")} ↗</a>`
      : `<span class="listing-contact">${escapeHTML(item.contact)}</span>`;
    const date = item.created_at
      ? new Date(item.created_at).toLocaleDateString(lang === "uz" ? "uz-UZ" : "ru-RU")
      : "";

    return `
      <article class="listing-card">
        <div class="listing-image">${image}</div>
        <div class="listing-body">
          <span class="listing-badge ${isFound ? "found" : ""}">
            ${isFound ? t("foundBadge") : t("lostBadge")}
          </span>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.description || categoryName(item.category))}</p>
          <div class="listing-meta">
            <span>⌖ ${escapeHTML(item.location)}</span>
            <span>▦ ${escapeHTML(categoryName(item.category))}</span>
            <span>${escapeHTML(date)}</span>
          </div>
          ${contact}
        </div>
      </article>`;
  }).join("");
}

["searchInput", "typeFilter", "categoryFilter"].forEach(id => {
  document.getElementById(id).addEventListener(
    id === "searchInput" ? "input" : "change",
    renderListings
  );
});

async function loadListings() {
  const grid = document.getElementById("listingsGrid");
  grid.innerHTML = `<div class="loading">${t("loading")}</div>`;

  const { data, error } = await db
    .from("listings")
    .select("id,type,category,title,description,location,contact,image_url,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    grid.innerHTML = `<div class="empty">${t("loadError")}</div>`;
    return;
  }

  listings = data || [];
  renderListings();
}

document.getElementById("listingForm").addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const message = document.getElementById("formMessage");
  const button = document.getElementById("submitBtn");
  const data = new FormData(form);

  const photo = data.get("photo");
  const title = String(data.get("title") || "").trim();
  const category = String(data.get("category") || "");
  const location = String(data.get("location") || "").trim();
  const contact = String(data.get("contact") || "").trim();

  if (!title || !category || !location || !contact) {
    message.textContent = t("required");
    message.className = "form-message error";
    return;
  }

  if (photo && photo.size > 5 * 1024 * 1024) {
    message.textContent = t("photoTooBig");
    message.className = "form-message error";
    return;
  }

  button.disabled = true;
  button.textContent = t("uploading");
  message.textContent = "";
  message.className = "form-message";

  let image_url = null;

  try {
    if (photo && photo.size) {
      const ext = (photo.name.split(".").pop() || "jpg")
        .toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `public/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await db.storage
        .from(BUCKET)
        .upload(path, photo, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.type || "image/jpeg"
        });

      if (uploadError) throw uploadError;

      image_url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const row = {
      type: String(data.get("type")),
      category,
      title,
      description: String(data.get("description") || "").trim(),
      location,
      contact,
      image_url
    };

    const { error } = await db.from("listings").insert(row);
    if (error) throw error;

    form.reset();
    document.querySelector('.type-option input[value="lost"]').checked = true;
    document.querySelectorAll(".type-option").forEach(label => {
      label.classList.toggle("selected", label.querySelector("input").checked);
    });

    message.textContent = t("published");
    message.className = "form-message";
    await loadListings();

  } catch (error) {
    console.error(error);
    message.textContent = error?.message?.toLowerCase().includes("storage")
      ? t("uploadError")
      : t("genericError");
    message.className = "form-message error";
  } finally {
    button.disabled = false;
    button.textContent = t("publish");
  }
});

applyLanguage();
loadListings();
