// ===== Находим элементы на странице =====
const form = document.querySelector(".form");
const typeSelect = document.querySelector("#deadline-type");
const dateInput = document.querySelector("#start-date");
const basisHint = document.querySelector("#deadline-basis");
const errorText = document.querySelector("#form-error");

const resultBlock = document.querySelector(".result");
const resultDate = resultBlock.querySelector(".result__date");
const resultNote = resultBlock.querySelector(".result__note");

// ===== Заполняем выпадающий список =====
function renderDeadlineOptions(types) {
  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = type.title;
    typeSelect.append(option);
  });
}

// ===== Подписи для единиц измерения =====
const unitLabels = {
  day: "дн.",
  month: "мес.",
  workday: "раб. дн.",
};

// ===== Находим вид срока по id =====
function getDeadlineType(id) {
  return deadlineTypes.find((type) => type.id === id);
}

// ===== Ошибки и результат =====
function showError(message) {
  errorText.textContent = message;
  resultBlock.classList.add("result_hidden");
}

function clearError() {
  errorText.textContent = "";
}

function showResult(date, note) {
  resultDate.textContent = formatDate(date);
  resultNote.textContent = note;
  resultBlock.classList.remove("result_hidden");
}

// ===== Показываем правовое основание при выборе =====
typeSelect.addEventListener("change", () => {
  const selectedType = getDeadlineType(typeSelect.value);
  basisHint.textContent = selectedType
    ? `Основание: ${selectedType.basis}`
    : "";
});

// ===== Расчёт при отправке формы =====
form.addEventListener("submit", (evt) => {
  // Без этого браузер перезагрузит страницу при отправке формы
  evt.preventDefault();
  clearError();

  // 1. Проверяем, что всё заполнено
  if (!typeSelect.value) {
    showError("Выберите вид срока");
    return;
  }
  if (!dateInput.value) {
    showError("Укажите дату события");
    return;
  }

  // 2. Считаем
  const type = getDeadlineType(typeSelect.value);
  const startDate = parseInputDate(dateInput.value);
  const result = calculateDeadline(startDate, type);

  // 3. Защита: в data.js указана неизвестная единица
  if (!result) {
    showError("Не удалось рассчитать срок: проверьте настройки вида срока");
    return;
  }

  // 4. Собираем пояснение
  const period = `${type.amount} ${unitLabels[type.unit]}`;
  let note = `${period} с ${formatDate(startDate)}. Основание: ${type.basis}.`;

  // Даты сравниваем через getTime() — число миллисекунд.
  // Сравнивать сами объекты через !== нельзя: это два разных объекта,
  // и они всегда «не равны», даже если дата одна и та же.
  if (result.deadline.getTime() !== result.original.getTime()) {
    const weekday = result.original.toLocaleDateString("ru-RU", {
      weekday: "long",
    });
    note +=
      ` Срок истекал в нерабочий день (${weekday}, ${formatDate(result.original)})` +
      " и перенесён на ближайший рабочий день.";
  }

  // Предупреждаем, если праздники за этот год не внесены в календарь
  if (!hasCalendarFor(result.deadline)) {
    note += ` Внимание: праздники ${result.deadline.getFullYear()} г. не учтены — проверьте по производственному календарю.`;
  }

  // 5. Показываем результат
  showResult(result.deadline, note);
});

// ===== Запуск =====
renderDeadlineOptions(deadlineTypes);
