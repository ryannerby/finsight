import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <SignIn routing="path" path="/login" />
    </div>
  );
}