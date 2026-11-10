'use client';

import * as React from 'react';
import type { DropdownOption } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center relative items-center gap-2',
        caption_label: 'hidden',
        nav: 'flex items-center gap-1',
        // Month/year dropdown container & selects (for captionLayout=\"dropdown*\")
        dropdowns: 'flex items-center justify-center gap-2',
        months_dropdown:
          'bg-popover text-popover-foreground border border-input rounded-md px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        years_dropdown:
          'bg-popover text-popover-foreground border border-input rounded-md px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 p-0 font-normal aria-selected:opacity-100'
        ),
        range_start:
          'day-range-start rounded-l-md bg-action text-white hover:bg-action hover:text-white',
        range_end:
          'day-range-end rounded-r-md bg-action text-white hover:bg-action hover:text-white',
        selected:
          'bg-action text-white hover:bg-action hover:text-white focus:bg-action focus:text-white',
        today: 'bg-accent text-accent-foreground',
        outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeftIcon className="size-4" />;
          if (orientation === 'right') return <ChevronRightIcon className="size-4" />;
          if (orientation === 'up') return <ChevronUpIcon className="size-4" />;
          return <ChevronDownIcon className="size-4" />;
        },
        // Native <select> for the month/year dropdowns. The previous
        // Shadcn Select-based override silently failed to render inside a
        // Popover-inside-a-Dialog (nested Radix portals); native selects
        // have no portal and always work.
        Dropdown: ({ value, options, onChange, 'aria-label': ariaLabel, disabled }) => {
          const selected = options?.find((o: DropdownOption) => o.value === value);
          return (
            <span className="relative inline-flex items-center">
              <span
                className={cn(
                  'border-input bg-popover text-popover-foreground inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs shadow-sm',
                  'pointer-events-none'
                )}
              >
                {selected?.label}
                <ChevronDownIcon className="size-3 opacity-50" />
              </span>
              <select
                value={value === undefined ? '' : String(value)}
                onChange={onChange}
                disabled={disabled}
                aria-label={ariaLabel}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {options?.map((option: DropdownOption) => (
                  <option
                    key={option.value}
                    value={String(option.value)}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </span>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
