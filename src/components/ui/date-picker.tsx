"use client"

import * as React from "react"

import { Button } from "./button"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { Label } from "./label"

export function DatePicker({ label = "select Date", date, onDateChange, disabled }: { label?: string, date: Date | undefined, onDateChange: (date: Date | undefined) => void, disabled?: boolean }) {
  const [open, setOpen] = React.useState(false)

  const handleTodayClick = () => {
    onDateChange(new Date());
    setOpen(false);
  }

  return (
    <div className="w-44">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="outline" id="date" className="justify-start font-normal">{date ? date.toLocaleDateString() : label}</Button>} />
        <PopoverContent className="w-auto overflow-hidden p-0" align="start" animation="scale">
          <div className="my-2 mx-4 flex items-center justify-between">
            <span className="">Select Date :</span>
            <Button variant={"outline"} onClick={handleTodayClick} disabled={disabled}>
              Today
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              onDateChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
