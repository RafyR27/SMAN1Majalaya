import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const { signIn, signUp, useSession, signOut, getSession } = createAuthClient({
  plugins: [adminClient()],
});
