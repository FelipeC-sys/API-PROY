// Formato de error documentado por el backend:
// { "error": { "code": "...", "message": "..." } }
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}