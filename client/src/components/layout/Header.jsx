import { useAuthStore } from "../../store/authStore";

export default function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 border-b px-6 flex items-center justify-between">
      <h1>Dashboard</h1>

      <span>
        Xin chào, {user?.name}
      </span>
    </header>
  );
}