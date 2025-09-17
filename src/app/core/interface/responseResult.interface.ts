export interface ResponseResultLst<T> {
	lstItem: T[];
	pagination: Pagination;
	isSuccess: boolean;
	lstError: any[];
	ticket: string;
	clientName: string;
	userName: string;
	serverName: string;
	resultado: number;
}

export interface ResponseResultItem<T> {
	item: T;
	isSuccess: boolean;
	lstError: any[];
	ticket: string;
	clientName: string;
	userName: string;
	serverName: string;
	resultado: number;
}

export interface Pagination {
	pageIndex: number;
	pageSize: number;
	totalRows: number;
}
