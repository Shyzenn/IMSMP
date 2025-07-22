import UserManagement from "@/app/components/UserManagement";

const Settings = () => {
  return (
    <>
      <div className="h-full bg-white rounded-md">
        <p className="text-center pt-10 text-2xl">User Management</p>
        <UserManagement />
      </div>
    </>
  );
};

export default Settings;
