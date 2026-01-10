import { JwtPayload } from "jsonwebtoken";

export type RefreshTokenPayloadType = {
    id: string;
    handle: string;
} & JwtPayload;

export type AccessTokenPayloadType = {
    id: string;
} & JwtPayload;