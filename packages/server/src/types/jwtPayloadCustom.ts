import { JwtPayload } from "jsonwebtoken";

export type RefreshTokenPayloadType = {
    id: string;
} & JwtPayload;

export type AccessTokenPayloadType = {
    id: string;
    handle: string;
} & JwtPayload;