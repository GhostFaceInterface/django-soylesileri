'use client';
import { useForm } from 'react-hook-form';
import { login, LoginData } from '../../lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginData>();
  const router = useRouter();

  const onSubmit = async (data: LoginData) => {
    await login(data);
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto flex flex-col gap-4">
      <input placeholder="Email" {...register('email')} className="border p-2" />
      <input type="password" placeholder="Password" {...register('password')} className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Giriş Yap</button>
    </form>
  );
}
