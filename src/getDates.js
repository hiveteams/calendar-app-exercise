import moment from 'moment';
import 'moment-recur';

export const getDates = (interval, daysOfWeek, startDate, endDate) => {
  const recurrence = moment()
    .recur({
      start: startDate,
      end: endDate,
    })
    .every(daysOfWeek)
    .daysOfWeek();
  let allDates;
  if (endDate === 'infinity') {
    allDates = recurrence.next(daysOfWeek.length * 5);
  } else {
    allDates = recurrence.all();
  }
  let counter = 0;
  return allDates
    .filter(elem => {
      counter++;
      if (counter <= daysOfWeek.length) {
        if (counter < +elem.format('e')) {
          counter = +elem.format('e');
        }
        return true;
      } else if (counter > daysOfWeek.length * interval) {
        counter = 1;
        return true;
      } else {
        return false;
      }
    })
    .map(elem => elem.format('L'));
};
