"use client"
import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";

const page = () => {
  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <h1>home page</h1>
    </div>
  );
}
export default page