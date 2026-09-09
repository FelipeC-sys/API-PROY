// TODO: confirmar contra el Swagger (https://sla-api.areasoftccyt.com/api/docs)
// los valores exactos que devuelve el backend para el rol.
export type Role = 'client' | 'agent' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}   