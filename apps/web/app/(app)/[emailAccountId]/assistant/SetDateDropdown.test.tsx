/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { format } from "date-fns/format";
import { addDays } from "date-fns/addDays";
import { startOfToday } from "date-fns/startOfToday";
import { subDays } from "date-fns/subDays";
import { SetDateDropdown } from "./SetDateDropdown";

(globalThis as { React?: typeof React }).React = React;

afterEach(cleanup);

describe("SetDateDropdown", () => {
  it("accepts a typed date", () => {
    const onChange = vi.fn();
    open({ onChange });

    fireEvent.change(screen.getByLabelText("Type a date"), {
      target: { value: "2021-03-14" },
    });

    expect(onChange).toHaveBeenCalledWith(new Date(2021, 2, 14));
  });

  it("ignores a typed date in the future", () => {
    const onChange = vi.fn();
    open({ onChange });

    fireEvent.change(screen.getByLabelText("Type a date"), {
      target: { value: format(addDays(new Date(), 2), "yyyy-MM-dd") },
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("sets the date from a preset", () => {
    const onChange = vi.fn();
    open({ onChange, showPresets: true });

    fireEvent.click(screen.getByRole("button", { name: "Last month" }));

    expect(onChange).toHaveBeenCalledWith(subDays(startOfToday(), 30));
  });

  it("hides presets unless requested", () => {
    open({ onChange: vi.fn() });

    expect(screen.queryByRole("button", { name: "Last month" })).toBeNull();
  });
});

function open(props: {
  onChange: (date?: Date) => void;
  showPresets?: boolean;
}) {
  render(<SetDateDropdown placeholder="Set start date" {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Set start date" }));
}
