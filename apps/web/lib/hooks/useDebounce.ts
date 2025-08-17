import { useEffect, useState } from "react";

const useDebounce = (value: string, delay?: number) => {
  const [debounce, setDebounce] = useState(value);
  useEffect(() => {
    setTimeout(() => {
      setDebounce(value);
    }, delay || 500);
  }, []);
  return debounce;
};

export default useDebounce;
