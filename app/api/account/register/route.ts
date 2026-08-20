import { getChatGPTUser } from "../../../chatgpt-auth";
import { saveAccount } from "../../../../lib/account";
import { registrationSchema } from "../../../../lib/validation";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in before creating an account." }, { status: 401 });
  try {
    const input = registrationSchema.parse(await request.json());
    const account = await saveAccount({ userId: user.userId, email: user.email, fullName: input.fullName, organization: input.organization });
    return Response.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Account registration failed", error);
    return Response.json({ error: "Your account could not be created. Check the entered details and try again." }, { status: 400 });
  }
}
