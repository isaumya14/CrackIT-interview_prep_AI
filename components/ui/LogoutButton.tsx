"use client";

import { logout } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      router.push("/sign-in");
    } else {
      alert("Logout failed. Try again.");
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      className="transition-all duration-200 hover:bg-red-700 hover:shadow-md hover:scale-[1.03] gap-2 cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
