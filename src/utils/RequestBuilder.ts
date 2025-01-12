import { getCookie } from "typescript-cookie";

export default class RequestBuilder {
  private static baseUrl: string = import.meta.env.VITE_BASE_URL;

  public static getBaseUrl(): string {
    return RequestBuilder.baseUrl;
  }

  public static constructHeader(): Record<string, Record<string, string>> {
    const jwt: string | undefined = getCookie("jwt");

    if (!jwt) {
      throw new Error("JWT token missing");
    }

    return {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
  }
}
