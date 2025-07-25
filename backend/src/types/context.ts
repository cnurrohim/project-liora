import type { JwtPayload } from "jsonwebtoken";

export type UserPayload = JwtPayload & {
  id: string;
  name: string;
  role: number;
};

export type Variables = {
  user: UserPayload;
};
