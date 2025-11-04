import UserManagement from "@/app/components/UserManagement";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <UserManagement />
    </Suspense>
  );
}
