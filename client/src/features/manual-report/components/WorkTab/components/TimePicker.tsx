import { TimeValue, TimePickerItem } from '../../../types/manualReport';
import { HOURS, MINUTES, PERIODS } from '../../../constants/time';

interface TimePickerProps {
  value: TimeValue;
  refs: {
    hours: React.RefObject<HTMLDivElement>;
    minutes: React.RefObject<HTMLDivElement>;
    period: React.RefObject<HTMLDivElement>;
  };
  onScroll: (
    ref: React.RefObject<HTMLDivElement>,
    items: TimePickerItem[],
    field: 'hours' | 'minutes' | 'period'
  ) => void;
  onWheel: (
    e: React.WheelEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement>,
    items: TimePickerItem[]
  ) => void;
  onItemClick: (
    ref: React.RefObject<HTMLDivElement>,
    itemIndex: number
  ) => void;
}

function TimePicker({
  value,
  refs,
  onScroll,
  onWheel,
  onItemClick,
}: TimePickerProps) {
  return (
    <div className="time-picker">
      <div className="time-picker-columns" dir="ltr">
        <div
          className="time-picker-column"
          ref={refs.hours}
          onScroll={() => onScroll(refs.hours, HOURS, 'hours')}
          onWheel={(e) => onWheel(e, refs.hours, HOURS)}
        >
          <div className="time-picker-padding"></div>
          {HOURS.map((hour, index) => (
            <div
              key={hour}
              className={`time-picker-item ${value.hours === hour ? 'time-picker-item-selected' : ''}`}
              onClick={() => onItemClick(refs.hours, index)}
            >
              {hour}
            </div>
          ))}
          <div className="time-picker-padding"></div>
        </div>
        <div
          className="time-picker-column"
          ref={refs.minutes}
          onScroll={() => onScroll(refs.minutes, MINUTES, 'minutes')}
          onWheel={(e) => onWheel(e, refs.minutes, MINUTES)}
        >
          <div className="time-picker-padding"></div>
          {MINUTES.map((minute, index) => (
            <div
              key={minute}
              className={`time-picker-item ${value.minutes === minute ? 'time-picker-item-selected' : ''}`}
              onClick={() => onItemClick(refs.minutes, index)}
            >
              {minute.toString().padStart(2, '0')}
            </div>
          ))}
          <div className="time-picker-padding"></div>
        </div>
        <div
          className="time-picker-column"
          ref={refs.period}
          onScroll={() => onScroll(refs.period, PERIODS, 'period')}
          onWheel={(e) => onWheel(e, refs.period, PERIODS)}
        >
          <div className="time-picker-padding"></div>
          {PERIODS.map((period, index) => (
            <div
              key={period}
              className={`time-picker-item ${value.period === period ? 'time-picker-item-selected' : ''}`}
              onClick={() => onItemClick(refs.period, index)}
            >
              {period}
            </div>
          ))}
          <div className="time-picker-padding"></div>
        </div>
      </div>
      <div className="time-picker-selection-indicator"></div>
    </div>
  );
}

export default TimePicker;
