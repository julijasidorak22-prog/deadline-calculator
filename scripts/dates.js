// ===== Функции для работы с датами =====

// Превращает строку из <input type="date"> ('2026-10-18') в объект Date.
// Почему не new Date('2026-10-18')? Такая строка читается как полночь по UTC,
// и в часовых поясах «западнее» Гринвича дата съезжает на день назад.
// new Date(год, месяц, день) создаёт дату в локальном времени — так надёжнее.
function parseInputDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day); // месяцы в JS считаются с 0!
}

// Прибавляет к дате N календарных дней.
// Важно: Date — изменяемый объект, поэтому сначала делаем копию,
// чтобы не испортить исходную дату.
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Прибавляет к дате N месяцев.
// Правило (п. 3 ст. 192 ГК РФ): срок в месяцах истекает в соответствующее
// число последнего месяца, а если такого числа нет — в последний день месяца.
//
// Ловушка: setMonth() так не умеет. 31 января + 1 месяц через setMonth
// даст 3 марта, потому что «31 февраля» JS переносит вперёд.
// Поэтому сначала узнаём, сколько дней в целевом месяце, и берём
// меньшее из двух: исходное число или последний день месяца.
function addMonths(date, months) {
  const year = date.getFullYear();
  const targetMonth = date.getMonth() + months; // может быть > 11 — это нормально
  const day = date.getDate();

  // День 0 следующего месяца = последний день нужного месяца.
  // Если targetMonth = 13, JS сам поймёт, что это февраль следующего года.
  const lastDayOfTargetMonth = new Date(year, targetMonth + 1, 0).getDate();

  return new Date(year, targetMonth, Math.min(day, lastDayOfTargetMonth));
}

// Проверяет, выходной ли день.
// getDay() возвращает день недели: 0 — воскресенье, 6 — суббота.
function isWeekend(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

// Превращает Date обратно в строку 'ГГГГ-ММ-ДД' — в том же формате,
// что и даты в holidays.js. Так их можно сравнивать через includes.
// padStart(2, '0') дописывает ноль слева: 3 → '03'.
function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Главная проверка: нерабочий ли день с учётом производственного календаря.
// Порядок проверок важен: сначала исключения, потом общее правило.
function isNonWorkingDay(date) {
  const key = toDateKey(date);

  if (workingWeekends.includes(key)) {
    return false; // рабочая суббота
  }
  if (holidays.includes(key)) {
    return true; // праздник или перенесённый выходной
  }
  return isWeekend(date);
}

// Есть ли у нас календарь на этот год
function hasCalendarFor(date) {
  return calendarYears.includes(date.getFullYear());
}

// Если дата выпала на нерабочий день — сдвигаем вперёд до ближайшего рабочего
// (ст. 193 ГК РФ, ч. 4 ст. 114 АПК РФ, ст. 108 ГПК РФ).
// while повторяет сдвиг, пока условие верно — так переживём и длинные каникулы.
function moveToWorkday(date) {
  const result = new Date(date);
  while (isNonWorkingDay(result)) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

// Прибавляет N рабочих дней: идём по календарю день за днём
// и засчитываем только рабочие. Выходные и праздники пропускаем.
function addWorkdays(date, days) {
  const result = new Date(date);
  let counted = 0;
  while (counted < days) {
    result.setDate(result.getDate() + 1);
    if (!isNonWorkingDay(result)) {
      counted += 1;
    }
  }
  return result;
}

// Форматирует дату по-русски: «18 октября 2026 г.»
function formatDate(date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Главная функция расчёта.
// Срок начинается на следующий день после события, поэтому
// последний день срока в N дней = дата события + N дней.
// Пример: событие 1-го числа, срок 10 дней → дни со 2-го по 11-е → 1 + 10 = 11.
//
// Функция возвращает объект с двумя датами:
//   original — день, когда срок истёк бы по календарю;
//   deadline — итоговый последний день с учётом переноса с выходных.
// Если они различаются — был перенос, и мы скажем об этом пользователю.
function calculateDeadline(startDate, type) {
  let original;

  if (type.unit === "day") {
    original = addDays(startDate, type.amount);
  } else if (type.unit === "month") {
    original = addMonths(startDate, type.amount);
  } else if (type.unit === "workday") {
    original = addWorkdays(startDate, type.amount);
  } else {
    return null; // неизвестная единица — защита от опечатки в data.js
  }

  return {
    original,
    deadline: moveToWorkday(original),
  };
}
