export const success = (data: any, message = 'OK') => ({ success: true, message, data });
export const fail = (message = 'Error', data?: any) => ({ success: false, message, data });
