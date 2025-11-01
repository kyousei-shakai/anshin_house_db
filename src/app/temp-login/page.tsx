    import TemporaryLoginForm from "@/components/TemporaryLoginForm";

export default function TemporaryLoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">開発用ログイン</h1>
        <TemporaryLoginForm />
      </div>
    </div>
  );
}