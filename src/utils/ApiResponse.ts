function ApiResponse(success: boolean, message: string, status: number) {
    return Response.json({
        success,
        message
    }, {
        status
    })
}

export { ApiResponse }

export interface APIResponse {
    success: boolean;
    message: string;
    status: number;
    userId?: string
}

export interface Payload {
    id: string,
    username: string,
    email: string,
    profileImage?: string
}