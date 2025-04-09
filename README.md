# Async Form Submission

Этот проект представляет собой лёгкую и удобную утилиту для асинхронной отправки HTML-форм с поддержкой:

Github pages - https://baujaasd.github.io/async-form-submission/

- Валидации полей ввода
- Загрузки файлов
- Таймаута запросов через `AbortController`
- Кастомных уведомлений
- Закрытия попапов после отправки
- Callback-функции после успешной отправки

---

## 🚀 Основная функция: `sendAjaxForm`

```js
sendAjaxForm(form, isPopup = false, callback, timeoutMs = 10000)
```

## Аргументы:

`form` - HTML-форма, которую нужно отправить.

`isPopup` – если форма размещена внутри модального окна (по умолчанию false).

`callback` – функция, которая выполнится после успешной отправки.

`timeoutMs` – таймаут для запроса в миллисекундах (по умолчанию 10 секунд).

## Поведение:

- Отключает кнопку отправки во время выполнения запроса.

- Автоматически показывает уведомление об успехе или ошибке через showNotification.

- Поддерживает JSON-ответ от сервера (`{ status: 'success', message?: '...' }`).

- Сбрасывает форму и закрывает попап (если указан `isPopup = true)`.

- Обрабатывает таймаут через `AbortController`.


## Уведомления

Для отображения сообщений используется кастомная система:

```js
window.notificationSystem.createNotification({
  title: "Успешно", // или "Ошибка"
  message: "Ваше сообщение",
  additionalClass: "error" // если нужно показать как ошибку
});
```

## Дополнительные функции

### Маска телефона

Автоматически применяется к <input type="tel"> с использованием IMask:

```js
IMask(target, {
  mask: "+{7} (000) 000-00-00",
});
```

### Очистка number полей

Удаляются любые символы, кроме цифр и точки:

```js
if (type === "number") {
  target.value = target.value.replace(/[^\d.]/g, "");
}
```

### Кастомные select'ы

Поддержка выпадающих списков через Choices.js:

```js
new Choices(el, {
  placeholderValue: "Выберите из списка",
  removeItemButton: true,
  searchEnabled: false
});
```

## Пример использования

```html
<form action="/submit" method="POST" onsubmit="event.preventDefault(); sendAjaxForm(this)">
  <input type="text" name="name" required>
  <input type="file" name="files[]" multiple>
  <button type="submit">Отправить</button>
</form>
```