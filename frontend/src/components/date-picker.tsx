'use client';

import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useRef, useState, type RefObject } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-invalid'?: boolean;
};

function parseDateValue(value?: string) {
  if (!value) return undefined;

  const parsed = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toApiDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

const CALENDAR_ESTIMATED_HEIGHT_PX = 320;
const VIEWPORT_PADDING_PX = 16;

function resolveTriggerElement(
  triggerRef: RefObject<HTMLButtonElement | null>,
  id?: string,
) {
  return triggerRef.current ?? (id ? document.getElementById(id) : null);
}

function getPreferredCalendarSide(trigger: HTMLElement): 'top' | 'bottom' {
  const rect = trigger.getBoundingClientRect();
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING_PX;
  const spaceAbove = rect.top - VIEWPORT_PADDING_PX;

  if (spaceAbove >= CALENDAR_ESTIMATED_HEIGHT_PX) {
    return 'top';
  }

  if (spaceBelow >= CALENDAR_ESTIMATED_HEIGHT_PX) {
    return 'bottom';
  }

  return spaceAbove > spaceBelow ? 'top' : 'bottom';
}

function updateCalendarSide(
  triggerRef: RefObject<HTMLButtonElement | null>,
  id: string | undefined,
  setSide: (side: 'top' | 'bottom') => void,
) {
  const trigger = resolveTriggerElement(triggerRef, id);
  if (trigger == null) return;

  setSide(getPreferredCalendarSide(trigger));
}

export function DatePicker({
  id,
  value,
  onChange,
  min,
  disabled,
  placeholder = 'Selecione a data',
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'top' | 'bottom'>('bottom');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedDate = parseDateValue(value);
  const minDate = parseDateValue(min);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      updateCalendarSide(triggerRef, id, setSide);
    }

    setOpen(nextOpen);
  }

  function handleTriggerPointerDown() {
    updateCalendarSide(triggerRef, id, setSide);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          onPointerDown={handleTriggerPointerDown}
          className={cn(
            'w-full justify-between px-3 font-normal',
            !selectedDate && 'text-muted-foreground',
          )}
        >
          <span>
            {selectedDate
              ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
              : placeholder}
          </span>
          <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        key={side}
        className="scrollbar-styled w-auto overflow-y-auto p-0"
        align="start"
        side={side}
        avoidCollisions={false}
        sideOffset={8}
      >
        <Calendar
          mode="single"
          locale={ptBR}
          captionLayout="dropdown"
          selected={selectedDate}
          startMonth={minDate ?? new Date(new Date().getFullYear(), 0)}
          endMonth={new Date(new Date().getFullYear() + 10, 11)}
          onSelect={(date) => {
            if (!date) return;
            onChange(toApiDate(date));
            setOpen(false);
          }}
          disabled={minDate ? { before: minDate } : undefined}
          defaultMonth={selectedDate ?? minDate}
        />
      </PopoverContent>
    </Popover>
  );
}
