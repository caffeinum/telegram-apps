import crypto from "crypto";

function objectToDict(obj: Record<string, any>): Record<string, string> {
  return Object.entries(obj)
    .map(([key, value]) => [
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value),
    ])
    .reduce((acc, [key, value]) => {
      if (typeof key === "string" && typeof value === "string") {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
}

function generateHash(data: Record<string, string>, botToken: string): string {
  const checkString = Object.entries(data)
    .filter(([key]) => key !== "hash")
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  return crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");
}

export function generateLoginUrl(userId: number): string {
  if (!userId) {
    throw new Error("User ID is required. Please provide a valid user ID.");
  }

  const mockInitData = {
    query_id: "mock_query_id",
    user: {
      id: userId,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
      language_code: "en",
    },
    auth_date: Math.floor(Date.now() / 1000),
  };

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN is not set in the environment variables"
    );
  }

  const dataDict = objectToDict(mockInitData);
  const hash = generateHash(dataDict, botToken);
  dataDict.hash = hash;

  const initDataEncoded = Object.entries(dataDict)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  const miniAppUrl = process.env.NEXT_PUBLIC_MINI_APP_URL;
  if (!miniAppUrl) {
    throw new Error(
      "NEXT_PUBLIC_MINI_APP_URL is not set in the environment variables"
    );
  }

  return `${miniAppUrl}/home?tgWebAppData=${encodeURIComponent(initDataEncoded)}`;
}
