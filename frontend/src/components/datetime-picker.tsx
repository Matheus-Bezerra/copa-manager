'use client';

import { format, isValid, parse, setHours, setMinutes, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useRef, useState, type RefObject } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm";
const DEFAULT_HOUR = 15;
const DEFAULT_MINUTE = 0;

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

type DateTimePickerProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-invalid'?: boolean;
};

function parseDateTimeValue(value?: string) {
  if (!value) return undefined;

  const parsed = parse(value, VALUE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

function parseDateValue(value?: string) {
  if (!value) return undefined;

  const parsed = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toValue(date: Date) {
  return format(date, VALUE_FORMAT);
}

function padTimePart(value: number) {
  return String(value).padStart(2, '0');
}

const CALENDAR_ESTIMATED_HEIGHT_PX = 400;
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

export function DateTimePicker({
  id,
  value,
  onChange,
  min,
  disabled,
  placeholder = 'Selecione data e hora',
  'aria-invalid': ariaInvalid,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'top' | 'bottom'>('bottom');
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedDateTime = parseDateTimeValue(value);
  const minDate = parseDateValue(min);

  const selectedHour = selectedDateTime?.getHours() ?? DEFAULT_HOUR;
  const selectedMinute = selectedDateTime?.getMinutes() ?? DEFAULT_MINUTE;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      updateCalendarSide(triggerRef, id, setSide);
    }

    setOpen(nextOpen);
  }

  function handleTriggerPointerDown() {
    updateCalendarSide(triggerRef, id, setSide);
  }

  function emitChange(date: Date, hour: number, minute: number) {
    onChange(toValue(setMinutes(setHours(date, hour), minute)));
  }

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;

    emitChange(date, selectedHour, selectedMinute);
  }

  function handleHourChange(hourValue: string) {
    const hour = Number(hourValue);
    const baseDate = selectedDateTime ?? startOfDay(new Date());

    emitChange(baseDate, hour, selectedMinute);
  }

  function handleMinuteChange(minuteValue: string) {
    const minute = Number(minuteValue);
    const baseDate = selectedDateTime ?? startOfDay(new Date());

    emitChange(baseDate, selectedHour, minute);
  }

  function handleClear() {
    onChange('');
    setOpen(false);
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
            !selectedDateTime && 'text-muted-foreground',
          )}
        >
          <span>
            {selectedDateTime
              ? format(selectedDateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
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
          selected={selectedDateTime}
          startMonth={minDate ?? new Date(new Date().getFullYear(), 0)}
          endMonth={new Date(new Date().getFullYear() + 10, 11)}
          onSelect={handleDateSelect}
          disabled={minDate ? { before: minDate } : undefined}
          defaultMonth={selectedDateTime ?? minDate}
        />

        <Separator />

        <div className="flex items-center gap-2 p-3">
          <span className="text-muted-foreground text-sm">Horário</span>
          <Select value={String(selectedHour)} onValueChange={handleHourChange}>
            <SelectTrigger className="w-[72px]" aria-label="Hora">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {HOURS.map((hour) => (
                <SelectItem key={hour} value={String(hour)}>
                  {padTimePart(hour)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-sm">:</span>
          <Select value={String(selectedMinute)} onValueChange={handleMinuteChange}>
            <SelectTrigger className="w-[72px]" aria-label="Minuto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {MINUTES.map((minute) => (
                <SelectItem key={minute} value={String(minute)}>
                  {padTimePart(minute)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex justify-end gap-2 p-2">
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              Limpar
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Confirmar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
