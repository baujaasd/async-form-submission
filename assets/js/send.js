// Список ошибок от сервера
const errorMessages = new Map([
  [400, "Неверный запрос. Проверьте корректность отправленных данных."],
  [401, "Неавторизованный доступ. Пожалуйста, войдите в систему."],
  [402, "Необходима оплата для выполнения запроса."],
  [403, "Доступ запрещён. У вас нет прав для этого действия."],
  [404, "Ресурс не найден. Убедитесь в правильности URL."],
  [405, "Метод не поддерживается. Попробуйте другой способ запроса."],
  [406, "Неприемлемый формат. Сервер не может обработать запрос."],
  [407, "Требуется аутентификация через прокси-сервер."],
  [408, "Истекло время ожидания ответа от сервера."],
  [409, "Конфликт. Вероятно, данные были изменены другим пользователем."],
  [410, "Ресурс безвозвратно удалён."],
  [411, "Отсутствует обязательный заголовок Content-Length."],
  [412, "Условие запроса не выполнено (Precondition Failed)."],
  [413, "Слишком большой размер запроса."],
  [414, "Слишком длинный URI."],
  [415, "Неподдерживаемый тип данных."],
  [416, "Недопустимый диапазон запроса."],
  [417, "Ожидание не удалось. Ошибка на уровне ожиданий сервера."],
  [418, "Я — чайник. (пасхалка в протоколе ☕)"],
  [422, "Ошибка валидации. Проверьте введённые данные."],
  [423, "Ресурс заблокирован."],
  [424, "Ошибка зависимости. Невозможно выполнить операцию."],
  [429, "Слишком много запросов. Попробуйте позже."],

  // 5xx — Ошибки сервера
  [500, "Внутренняя ошибка сервера. Попробуйте позже."],
  [501, "Метод не реализован на сервере."],
  [502, "Плохой шлюз. Сервер получил недопустимый ответ от другого сервера."],
  [503, "Сервер временно недоступен. Обновите страницу позже."],
  [504, "Сервер не дождался ответа от другого сервера."],
  [505, "HTTP-версия не поддерживается."],
  [507, "Недостаточно места на сервере для выполнения запроса."],
  [508, "Обнаружено бесконечное перенаправление (Loop Detected)."],
  [511, "Требуется авторизация для использования сети."]
]);

/**
 * Асинхронная отправка формы с поддержкой файлов, таймаутом и кастомными уведомлениями
 *
 * @param {HTMLFormElement} form - Форма для отправки
 * @param {boolean} isPopup - Форма в попапе?
 * @param {Function} [callback] - Callback после успешной отправки
 * @param {number} timeoutMs - Таймаут (по умолчанию 10000 мс)
 */
async function sendAjaxForm(form, isPopup = false, callback, timeoutMs = 10000) {
  if (!(form instanceof HTMLFormElement)) return;

  if (!form.checkValidity()) {
    notifyErrorByCode(400, "Пожалуйста, заполните все обязательные поля.");
    return;
  }

  const submitBtn = form.querySelector("[type=submit]");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add("disabled");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const formData = new FormData(form);

    const response = await fetch(form.action || window.location.href, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) {
      notifyErrorByCode(response.status, `Ошибка: ${response.statusText || "Неизвестная ошибка"}`);
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      notifyErrorByCode(500, "Ответ сервера не является корректным JSON.");
      throw new Error("Неверный JSON от сервера");
    }

    if (data.status === 'success') {
      if (isPopup && typeof togglePopup === 'function') {
        const popup = form.closest('.popup');
        if (popup?.id) togglePopup(popup.id);
      }

      form.reset();

      if (typeof callback === 'function') {
        callback(data);
      } else {
        const msg = form.dataset.successMessage || "Форма успешно отправлена.";
        showNotification("Успешно", msg);
      }

    } else {
      const serverMsg = data.message || "Ошибка на сервере.";
      notifyErrorByCode(500, serverMsg);
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      notifyErrorByCode(408, "Время ожидания истекло. Попробуйте снова.");
    } else {
      console.error("Ошибка отправки формы:", error);
      notifyErrorByCode(500, error.message || "Произошла неизвестная ошибка.");
    }

  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("disabled");
    }
  }
}

/**
 * Показывает уведомление об ошибке по HTTP-коду.
 *
 * Использует `window.notificationSystem.createNotification`, если он доступен.
 * Если система уведомлений отсутствует — сообщение будет выведено в консоль (или `alert` в `showNotification`).
 *
 * @param {number} statusCode - HTTP-код ответа от сервера (например, 404, 500 и т.д.)
 * @param {string} [fallbackMessage="Ошибка отправки формы."] - Сообщение по умолчанию, если код не найден в `errorMessages`
 */
function notifyErrorByCode(statusCode, fallbackMessage = "Ошибка отправки формы.") {
  const message = errorMessages.get(statusCode) || fallbackMessage;

  if (window.notificationSystem?.createNotification) {
    window.notificationSystem.createNotification({
      title: "Ошибка",
      message,
      type: "error"
    });
    console.warn("Уведомление:", message);
  } else {
    console.warn("Уведомление:", message);
    alert(`Уведомление:, ${message}`)
  }
}

/**
 * Универсальная функция для отображения уведомления.
 *
 * Может использоваться для любых типов сообщений: успех, ошибка, информация.
 * Если библиотека уведомлений недоступна, использует `console.log` и `alert` как fallback.
 *
 * @param {string} [title="Уведомление"] - Заголовок уведомления (например, "Ошибка", "Успешно")
 * @param {string} [message=""] - Основной текст уведомления
 * @param {boolean} [isError=false] - Если true, будет показано уведомление с типом `error`, иначе — `success`
 */
function showNotification(title = "Уведомление", message = "", isError = false) {
  if (window.notificationSystem?.createNotification) {
    window.notificationSystem.createNotification({
      title,
      message,
      type: isError ? 'error' : 'success'
    });
  } else {
    console.log(`${title}: ${message}`);
    alert(`${title}\n\n${message}`);
  }
}
