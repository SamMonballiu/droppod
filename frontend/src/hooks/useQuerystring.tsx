export function useQuerystring() {
  const url = new URL(window.location.href);

  return {
    has: (key: string, value?: string) => {
      if (value !== undefined) {
        return url.searchParams.get(key) === value;
      } else {
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
      console.log(
        "qs update url:",
        key,
        value === "" ? "empty" : value,
        url.toString()
      );
      history.replaceState(null, "", url);
      //setLocation(url.toString(), { replace: true });
    },
  };
}
