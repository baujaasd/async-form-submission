document.addEventListener("DOMContentLoaded", function () {
  // input type validates
  document.body.addEventListener(
    "input",
    (async = (event) => {
      let target = event.target;
      if (target.tagName === "INPUT") {
        let type = target.getAttribute("type");
        if (type === "number") {
          target.value = target.value.replace(/[^\d.]/g, "");
        } else if (type === "tel" && !target.dataset.imaskInit) {
          IMask(target, {
            mask: "+{7} (000) 000-00-00",
          });
          target.dataset.imaskInit = true; // помечаем, что маска уже инициализирована
        } else {
          return false;
        }
      }
    })
  );

  // custom select
  (async = () => {
    const selects = document.querySelectorAll(".custom-select");
    selects?.forEach((el) => {
      new Choices(el, {
        noResultsText: "Ничего не найдено",
        itemSelectText: "",
        allowHTML: false,
        searchEnabled: false,
        noChoicesText: "Ничего нет",
        removeItemButton: true,
        placeholder: true,
        placeholderValue: "Выберите из списка",
      });
    });
  })();

  // loader
  (() => {
    const loader = document.querySelector("#loader");
    setTimeout(() => {
      loader?.classList.add("load");
    }, 250);
  })();

});

/**
 * Асинхронная отправка формы с поддержкой файлов, таймаутом и кастомными уведомлениями
 *
 * @param {HTMLFormElement} form - Форма для отправки
 * @param {boolean} isPopup - Форма в попапе?
 * @param {Function} [callback] - Callback после успешной отправки
 * @param {number} timeoutMs - Таймаут (по умолчанию 10000 мс)
 */
async function sendAjaxForm(form, isPopup = false, callback, timeoutMs = 10000) {
  if (!form.checkValidity()) {
    showNotification("Ошибка", "Пожалуйста, заполните все обязательные поля.", true);
    return;
  }

  const submitBtn = form.querySelector("[type=submit]");
  if (!submitBtn) return;

  // Блокировка кнопки отправки
  submitBtn.disabled = true;
  submitBtn.classList.add("disabled");

  // Таймаут через AbortController
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const formData = new FormData(form);

    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timer); // снимаем таймер после ответа

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error("Неверный JSON от сервера");
    }

    if (data.status === 'success') {
      // Закрываем попап
      if (isPopup && form.closest('.popup')) {
        togglePopup(form.closest('.popup').id);
      }

      form.reset(); // сброс формы

      if (typeof callback === 'function') {
        callback(data);
      } else {
        const msg = form.dataset.successMessage || "Форма успешно отправлена.";
        showNotification("Успешно", msg);
      }

    } else {
      const serverMsg = data.message || "Ошибка на сервере.";
      showNotification("Ошибка", serverMsg, true);
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      showNotification("Ошибка", "Время ожидания истекло. Попробуйте снова.", true);
    } else {
      console.error("Ошибка отправки формы:", error);
      showNotification("Ошибка", error.message || "Не удалось отправить форму.", true);
    }

  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("disabled");
  }
}

/**
 * Функция для показа кастомного уведомления
 * Использует систему уведомлений window.notificationSystem
 * 
 * @param {string} title - Заголовок уведомления (например, "Успешно" или "Ошибка")
 * @param {string} message - Текст сообщения для отображения
 * @param {boolean} [isError=false] - Флаг, если это ошибка (добавляется класс 'error')
 */
function showNotification(title, message, isError = false) {
  window.notificationSystem.createNotification({
    title: title,
    message: message,
    additionalClass: isError ? 'error' : ''  // Добавляем класс 'error' для ошибок
  });
}

// file upload ui
document.addEventListener('DOMContentLoaded', () => {
  const fileInputs = document.querySelectorAll('input[type="file"][multiple]');

  for (const input of fileInputs) {
    const label = input.closest('.input-file')?.querySelector('.input-file--text');
    if (!label) continue;

    input.addEventListener('change', () => {
      const count = input.files.length;

      // Защита: если input "сломался" или браузер не поддерживает FileList
      if (!input.files || typeof count !== 'number') {
        label.textContent = 'Ошибка выбора файла';
        return;
      }

      if (count === 0) {
        label.textContent = 'Прикрепить файл / файлы';
      } else if (count === 1) {
        label.textContent = `Выбран файл: ${input.files[0].name}`;
      } else {
        label.textContent = `Файлов выбрано: ${count}`;
      }
    });
  }
});
