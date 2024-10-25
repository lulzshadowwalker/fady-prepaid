export default class Config {
  static get environment() {
    return process.env.NODE_ENV;
  }

  static get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("env.JWT_SECRET is not set");
    }

    return secret;
  }

  //  WARNING: This is a placeholder since we do not have a "real" auth system yet for admins
  static get username(): string {
    const username = process.env.ADMIN_USERNAME;
    if (!username) {
      throw new Error("env.ADMIN_USERNAME is not set");
    }

    return username;
  }

  // WARNING: This is a placeholder since we do not have a "real" auth system yet for admins
  static get password(): string {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      throw new Error("env.ADMIN_PASSWORD is not set");
    }


    return password;
  }
}
