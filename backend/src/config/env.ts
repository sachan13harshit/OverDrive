import "dotenv/config";

export const envChecker = () => {
  const {
    DATABASE_URL,
    PORT,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    JWT_SECRET,
    FRONTEND_URL,
    OPENAI_API_KEY,
  } = process.env;

  const missingVars: string[] = [];

  if (!DATABASE_URL) missingVars.push("DATABASE_URL");
  if (!PORT) missingVars.push("PORT");
  if (!GOOGLE_CLIENT_ID) missingVars.push("GOOGLE_CLIENT_ID");
  if (!GOOGLE_CLIENT_SECRET) missingVars.push("GOOGLE_CLIENT_SECRET");
  if (!GOOGLE_REDIRECT_URI) missingVars.push("GOOGLE_REDIRECT_URI");
  if (!JWT_SECRET) missingVars.push("JWT_SECRET");
  if (!FRONTEND_URL) missingVars.push("FRONTEND_URL");
  if (!OPENAI_API_KEY) missingVars.push("OPENAI_API_KEY");

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variable(s): ${missingVars.join(", ")}`);
  }
};
