"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen ">
      <Button
        onClick={() => {
          router.push("/pestroutes-demo");
        }}
      >
        Pestroutes Demo
      </Button>
    </div>
  );
}
