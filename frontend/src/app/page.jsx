"use client"; // Make it a client component

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "./componets/LandingPage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Get role from cookies
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userRole="))
      ?.split("=")[1];

    if (!role) {
      // No role, stay on landing page
      return;
    }
    // Role-based redirection
    if (role === "recruiter") {
      router.replace("/recruiter/dashboard");
    } else if (role === "jobseeker") {
      router.replace("/jobseeker/dashboard");
    }
  }, [router]);

  return <LandingPage/>;
}
