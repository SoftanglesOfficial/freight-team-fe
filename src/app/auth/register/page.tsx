"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Self-registration is disabled. Redirect to login.
    router.replace("/auth/login");
  }, [router]);

  return null;
}
