import { useLocation } from "wouter";

export function useQuerystring() {
  const url = new URL(window.location.href);
  const [, setLocation] = useLocation();

  return {
    has: (key: string, value?: string) => {
      if (value !== undefined) {
        return url.searchParams.get(key) === value;
      } else {
        return url.searchParams.has(key);
      }
    },
    in: (key: string, values: string[]) => {
      return (
        url.searchParams.has(key) && values.includes(url.searchParams.get(key)!)
      );
    },
    get: url.searchParams.get.bind(url.searchParams),
    search: url.search,
    update: (key: string, value: string) => {
      if (value === "") {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
      setLocation(url.toString(), { replace: true });
    },
  };
}
