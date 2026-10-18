// Виды сроков.
// unit:
//   'month'   — срок в месяцах;
//   'day'     — календарные дни;
//   'workday' — рабочие дни (в АПК и ГПК в сроки, исчисляемые днями,
//               не включаются нерабочие дни: ч. 3 ст. 114 АПК, ч. 3 ст. 107 ГПК).
// basis — правовое основание, покажем его пользователю под списком.

const deadlineTypes = [
  {
    id: "apk-appeal",
    title: "Апелляционная жалоба (АПК)",
    amount: 1,
    unit: "month",
    basis: "ч. 1 ст. 259 АПК РФ",
  },
  {
    id: "apk-cassation",
    title: "Кассационная жалоба в окружной суд (АПК)",
    amount: 2,
    unit: "month",
    basis: "ч. 1 ст. 276 АПК РФ",
  },
  {
    id: "bankruptcy-appeal",
    title: "Апелляция на определение в деле о банкротстве",
    amount: 10,
    unit: "workday",
    basis: "п. 3 ст. 61 Закона о банкротстве",
  },
  {
    id: "gpk-appeal",
    title: "Апелляционная жалоба (ГПК)",
    amount: 1,
    unit: "month",
    basis: "ч. 2 ст. 321 ГПК РФ",
  },
  {
    id: "gpk-cassation",
    title: "Кассационная жалоба (ГПК)",
    amount: 3,
    unit: "month",
    basis: "ч. 1 ст. 376 ГПК РФ",
  },
  {
    id: "gpk-private",
    title: "Частная жалоба (ГПК)",
    amount: 15,
    unit: "workday",
    basis: "ст. 332 ГПК РФ",
  },
  {
    id: "court-order-cancel",
    title: "Возражения на судебный приказ (ГПК)",
    amount: 10,
    unit: "workday",
    basis: "ст. 128 ГПК РФ",
  },
  {
    id: "claim-answer",
    title: "Ответ на претензию (общий срок)",
    amount: 30,
    unit: "day",
    basis: "ч. 5 ст. 4 АПК РФ",
  },
];
