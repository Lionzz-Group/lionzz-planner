export const getStartOfWeek = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(newDate.setDate(diff));
};

export const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const getMonthGrid = (date) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const gridStartDate = getStartOfWeek(firstDayOfMonth);
  
  const days = [];
  
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStartDate);
    d.setDate(d.getDate() + i);
    days.push({
      date: d,
      isCurrentMonth: d.getMonth() === month,
    });
  }
  
  return days;
};