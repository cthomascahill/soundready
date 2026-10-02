import { useState, useRef } from "react";

// Local text state that saves to the database 600ms after the user stops typing
export default function useDebouncedField(initial, onSave, delay = 600) {
  const [value, setValue] = useState(initial || "");
  const timer = useRef(null);

  const change = (val) => {
    setValue(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(val), delay);
  };

  return [value, change];
}