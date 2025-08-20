import { useEffect, useState } from "react";

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!url || url.includes("undefined")) {
      setIsError(true);
      setIsLoading(false);
      console.log("url is undefined");
      return;
    }
    setIsLoading(true);
    setIsError(false);
    setSocket(null);

    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsLoading(false);
      setIsError(false);
      setSocket(ws);
    };

    ws.onclose = (event: CloseEvent) => {
      setSocket(null);
      if (!event.wasClean) {
        setIsError(true);
      }
      setIsLoading(true);
    };

    ws.onerror = (error) => {
      setIsLoading(true);
      setIsError(true);
      setSocket(null);
    };

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [url]);

  return { socket, isLoading, isError };
};
