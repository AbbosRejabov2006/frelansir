// O'zbek tili uchun sana va vaqt formatlash
export const formatDateUzbek = (date: Date): string => {
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  
  const weekdays = [
    'yakshanba', 'dushanba', 'seshanba', 'chorshanba', 
    'payshanba', 'juma', 'shanba'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const weekday = weekdays[date.getDay()];
  
  return `${day}-${month} ${year}, ${weekday}`;
};

export const formatTimeUzbek = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTimeUzbek = (date: Date): string => {
  return `${formatDateUzbek(date)}, ${formatTimeUzbek(date)}`;
};

export const formatShortDateUzbek = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};
