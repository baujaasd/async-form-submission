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
