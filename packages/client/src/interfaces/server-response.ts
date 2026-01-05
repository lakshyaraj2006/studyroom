export interface ServerResponse<T = null> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}
