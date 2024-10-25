"use server";

/**
 *  NOTE: 
 *  This module contains a very basic authentication system that verifies the user's JWT token.
 *  and not much beyond that since this is a very specialized temporary dashboard
 */

import { cookies } from "next/headers";
import { z } from "zod";

import { jwtVerify, SignJWT } from "jose";
import Config from "@/lib/config";
import { TokenNotFound, Forbidden } from "@/lib/auth";
import { redirect } from "next/navigation";

interface JwtCustomClaims {
  sub: string | number;
  exp: number;
}

/**
 * Verifies the user's JWT token and returns its payload if it's valid.
 */
export async function authenticate(token: string | undefined) {
  if (!token) throw new TokenNotFound("Missing user token");

  try {
    const verified = await jwtVerify<JwtCustomClaims>(
      token,
      new TextEncoder().encode(Config.jwtSecret),
    );

    return verified.payload as JwtCustomClaims;
  } catch (err) {
    throw err;
  }
}

/**
 * Logs the user in and sets the access token in the cookie.
 */
export async function login(username: string, password: string) {
  const schema = z.object({
    username: z.string().nonempty({ message: "Username cannot be empty" }),
    password: z.string().nonempty({ message: "Password cannot be empty" }),
  })

  const fields = schema.safeParse({ username, password });
  if (!fields.success) {
    const errorMessage = fields.error.errors.map((error) => error.message).join(", ");

    return { errorMessage }
  }

  if (username !== Config.username || password !== Config.password) {
    return { errorMessage: "Invalid username or password" };
  }

  const accessToken = await generateToken();
  await setCookie(accessToken);

  redirect("/");
}

export async function forbidden() {
  throw new Forbidden("Forbidden");
}

async function setCookie(accessToken: string) {
  const store = await cookies();

  const opts = {
    secure: true,
    httpOnly: true,
    sameSite: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };

  store.set("fady-access-token", accessToken, opts);
}

async function generateToken(): Promise<string> {
  const secret = new TextEncoder().encode(Config.jwtSecret)
  const alg = 'HS256'

  const jwt = await new SignJWT()
    .setProtectedHeader({ alg })
    .setIssuedAt()
    // .setIssuer('urn:example:issuer')
    // .setAudience('urn:example:audience')
    .setExpirationTime('2h')
    .sign(secret)

  return jwt;
}

