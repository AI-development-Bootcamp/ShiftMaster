import { useCallback, useRef, useEffect } from 'react';
import { TimeValue, TimePickerItem, TimePickerRefs } from '../types/manualReport';
import { HOURS, MINUTES, PERIODS, TIME_PICKER_ITEM_HEIGHT } from '../constants/time';

interface UseTimePickerProps {
  currentTime: TimeValue;
  setCurrentTime: (time: TimeValue) => void;
  editingField: string | null;
}

export function useTimePicker({
  currentTime,
  setCurrentTime,
  editingField,
}: UseTimePickerProps) {
  const refsMap = useRef<Map<string, TimePickerRefs>>(new Map());

  const getRefs = useCallback((field: string): TimePickerRefs => {
    if (!refsMap.current.has(field)) {
      refsMap.current.set(field, {
        hours: { current: null },
        minutes: { current: null },
        period: { current: null },
      });
    }
    return refsMap.current.get(field)!;
  }, []);

  const scrollToSelectedValues = useCallback(() => {
    if (!editingField) return;

    const refs = getRefs(editingField);

    const hourIndex = HOURS.indexOf(currentTime.hours);
    if (refs.hours.current && hourIndex >= 0) {
      refs.hours.current.scrollTop = hourIndex * TIME_PICKER_ITEM_HEIGHT;
    }
    const minuteIndex = MINUTES.indexOf(currentTime.minutes);
    if (refs.minutes.current && minuteIndex >= 0) {
      refs.minutes.current.scrollTop = minuteIndex * TIME_PICKER_ITEM_HEIGHT;
    }
    const periodIndex = PERIODS.indexOf(currentTime.period);
    if (refs.period.current && periodIndex >= 0) {
      refs.period.current.scrollTop = periodIndex * TIME_PICKER_ITEM_HEIGHT;
    }
  }, [editingField, currentTime, getRefs]);

  useEffect(() => {
    scrollToSelectedValues();
  }, [scrollToSelectedValues]);

  const handleScroll = useCallback(
    (
      ref: React.RefObject<HTMLDivElement>,
      items: TimePickerItem[],
      field: 'hours' | 'minutes' | 'period'
    ) => {
      if (!ref.current) return;

      const scrollTop = ref.current.scrollTop;
      const index = Math.round(scrollTop / TIME_PICKER_ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

      if (field === 'hours' && currentTime.hours !== items[clampedIndex]) {
        setCurrentTime({ ...currentTime, hours: items[clampedIndex] as number });
      } else if (
        field === 'minutes' &&
        currentTime.minutes !== items[clampedIndex]
      ) {
        setCurrentTime({
          ...currentTime,
          minutes: items[clampedIndex] as number,
        });
      } else if (
        field === 'period' &&
        currentTime.period !== items[clampedIndex]
      ) {
        setCurrentTime({
          ...currentTime,
          period: items[clampedIndex] as 'AM' | 'PM',
        });
      }
    },
    [currentTime, setCurrentTime]
  );

  const handleWheel = useCallback(
    (
      e: React.WheelEvent<HTMLDivElement>,
      ref: React.RefObject<HTMLDivElement>,
      items: TimePickerItem[]
    ) => {
      // ✅ Don't call preventDefault() on wheel — can be passive and cause the warning
      e.stopPropagation();

      const el = ref.current;
      if (!el) return;

      const currentScroll = el.scrollTop;
      const currentIndex = Math.round(currentScroll / TIME_PICKER_ITEM_HEIGHT);

      const direction = e.deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(currentIndex + direction, items.length - 1));

      el.scrollTop = newIndex * TIME_PICKER_ITEM_HEIGHT;
    },
    []
  );

  const handleItemClick = useCallback(
    (ref: React.RefObject<HTMLDivElement>, itemIndex: number) => {
      if (!ref.current) return;

      const targetScroll = itemIndex * TIME_PICKER_ITEM_HEIGHT;

      ref.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    },
    []
  );

  return {
    getRefs,
    handleScroll,
    handleWheel,
    handleItemClick,
  };
}
