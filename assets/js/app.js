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

  (() => {
    const loader = document.querySelector("#loader");
    setTimeout(() => {
      loader?.classList.add("load");
    }, 250);
  })();

});

function handleSubmit(event) {

  event.preventDefault();

  const form = event.target.closest("form");
  let isFormValid = true;

  const inputs = form.querySelectorAll("[required]");
  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("error");
      isFormValid = false;
    } else {
      input.classList.remove("error");
    }
  });

  if (!isFormValid) {
    window.notificationSystem.createNotification({
      title: "Ошибка",
      message: "Заполните обязательные поля формы",
      additionalClass: "error"
    });
    return; // Прекращаем выполнение функции, если форма невалидна
  }

  const formData = new FormData(form);
  const formJSON = Object.fromEntries(formData.entries());

  try {
    // const response = await fetch(form.getAttribute("action"), {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formJSON),
    // });

    // if (response.ok) {
    //   const responseData = await response.json();

    // } else {
    //   console.error("HTTP Error:", response.status);
    // }

    window.notificationSystem.createNotification({
      title: "Форма была успешно отправлена",
      message: "Скоро с мы с Вами свяжемся",
    });

  } catch (error) {
    console.error("Submission error:", error);
  } finally {
    // some
  }

  // Функция для изменения содержимого мета-тега viewport
function setViewportContent(content) {
  let viewportMetaTag = document.querySelector('meta[name="viewport"]');
  if (viewportMetaTag) {
    viewportMetaTag.content = content;
  }
}

// Элементы формы, для которых необходимо отключить масштабирование
const formInputs = document.querySelectorAll('input, select, textarea');

// Добавление обработчиков событий
formInputs.forEach(input => {
  input.addEventListener('focus', () => {
    // Отключаем масштабирование при фокусе
    setViewportContent("width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
  });

  input.addEventListener('blur', () => {
    // Восстанавливаем масштабирование при потере фокуса
    setViewportContent("width=device-width, initial-scale=1.0");
  });
});

}
