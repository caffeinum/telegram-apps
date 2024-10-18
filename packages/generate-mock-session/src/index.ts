#!/usr/bin/env node

import pkg from "@next/env";
import { generateLoginUrl } from "./utils.js";

const { loadEnvConfig } = pkg;
// Load environment variables
loadEnvConfig(process.cwd(), true);

// Set default values for PORT and NEXT_PUBLIC_MINI_APP_URL
const PORT = process.env.PORT || "3000";
process.env.NEXT_PUBLIC_MINI_APP_URL =
  process.env.NEXT_PUBLIC_MINI_APP_URL || `http://localhost:${PORT}`;

// Parse user ID from command line arguments or environment variable
const args = process.argv.slice(2);
const userIdArg = args[0];
const userIdEnv = process.env.MOCK_USER_ID;

let userId: number | undefined;
if (userIdArg) {
  userId = parseInt(userIdArg, 10);
} else if (userIdEnv) {
  userId = parseInt(userIdEnv, 10);
}

if (!userId || isNaN(userId)) {
  console.error(
    "Invalid or missing user ID. Please provide a valid number via command line argument or MOCK_USER_ID environment variable."
  );
  process.exit(1);
}

try {
  const loginUrl = generateLoginUrl(userId);
  if (process.stdout.isTTY) {
    console.log("Login URL:", loginUrl);
  } else {
    process.stdout.write(loginUrl);
  }
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("An unknown error occurred");
  }
  process.exit(1);
}
