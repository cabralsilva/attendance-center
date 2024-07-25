export interface IPayloadTable<T> {
  items: T[];
  metadata?: {
    [key: string]: any;
  };
  paging?: {
    limit: number;
    page: number;
    total: number;
    totalPages?: number;
    startIndex?: number;
    endIndex?: number;
  };
}