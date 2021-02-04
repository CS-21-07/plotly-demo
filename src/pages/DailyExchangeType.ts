export const DailyExchange = () => {
  type DailyExchange = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose?: number;
    volume: number;
  };
};
