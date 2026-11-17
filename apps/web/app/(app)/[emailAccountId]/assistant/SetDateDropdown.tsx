"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns/format";
import { isSameDay } from "date-fns/isSameDay";
import { isValid } from "date-fns/isValid";
import { parse } from "date-fns/parse";
import { startOfToday } from "date-fns/startOfToday";
import { subDays } from "date-fns/subDays";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { cn } from "@/utils";
import { getDateFnsLocale } from "@/utils/i18n/date-fns-locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { List } from "@/components/List";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DATE_INPUT_FORMAT = "yyyy-MM-dd";
const MIN_DATE = new Date("1900-01-01");

const PRESETS = [
  { days: 7, label: msg`Last week` },
  { days: 30, label: msg`Last month` },
  { days: 90, label: msg`Last 3 months` },
  { days: 365, label: msg`Last year` },
];

export function SetDateDropdown({
  onChange,
  value,
  placeholder,
  disabled,
  showPresets,
}: {
  onChange: (date?: Date) => void;
  value?: Date;
  placeholder?: string;
  disabled?: boolean;
  showPresets?: boolean;
}) {
  const { i18n, t } = useLingui();
  const [month, setMonth] = useState<Date>(value ?? new Date());

  const selectDate = (date: Date) => {
    onChange(date);
    setMonth(date);
  };

  const today = startOfToday();
  const selectedPreset = value
    ? PRESETS.find((preset) => isSameDay(value, subDays(today, preset.days)))
    : undefined;

  return (
    <Popover
      modal={true}
      onOpenChange={(open) => {
        if (open) setMonth(value ?? new Date());
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground",
          )}
          disabled={disabled}
        >
          {value ? (
            i18n.date(value, { dateStyle: "long" })
          ) : (
            <span>{placeholder || <Trans>Set a date</Trans>}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="border-b border-gray-200 p-3">
          <Input
            type="date"
            aria-label={t`Type a date`}
            min={format(MIN_DATE, DATE_INPUT_FORMAT)}
            max={format(today, DATE_INPUT_FORMAT)}
            value={value ? format(value, DATE_INPUT_FORMAT) : ""}
            onChange={(event) => {
              const date = parseDateInput(event.target.value);
              if (date) selectDate(date);
            }}
          />
        </div>
        <Calendar
          locale={getDateFnsLocale(i18n.locale)}
          mode="single"
          captionLayout="dropdown-buttons"
          fromYear={2000}
          toDate={new Date()}
          month={month}
          onMonthChange={setMonth}
          selected={value}
          onSelect={onChange}
          disabled={(date) => date > new Date() || date < MIN_DATE}
          initialFocus
          rightContent={
            showPresets ? (
              <List
                value={selectedPreset ? String(selectedPreset.days) : undefined}
                items={PRESETS.map((preset) => ({
                  value: String(preset.days),
                  label: i18n._(preset.label),
                }))}
                className="min-w-32"
                onSelect={(item) =>
                  selectDate(subDays(today, Number(item.value)))
                }
              />
            ) : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
}

// A native date input reports "" while a typed date is incomplete, so only
// complete, in-range dates are accepted.
function parseDateInput(text: string) {
  if (!text) return;
  const date = parse(text, DATE_INPUT_FORMAT, new Date());
  if (!isValid(date) || date > new Date() || date < MIN_DATE) return;
  return date;
}
