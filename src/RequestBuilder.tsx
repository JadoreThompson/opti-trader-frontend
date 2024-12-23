import { getCookie } from "typescript-cookie";

class RequestBuilder {
  private static baseUrl: string = "http://127.0.0.1:8000";
  private static header: Record<string, string>;

  public static getBaseUrl(): string {
    return RequestBuilder.baseUrl;
  }

  public static constructHeader(jwt: string): Record<string, string> {
    RequestBuilder.header = { Authorization: `Bearer ${getCookie("jwt")}` };
    return RequestBuilder.header;
  }
}
