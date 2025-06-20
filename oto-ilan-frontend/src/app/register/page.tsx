'use client';
import { useForm } from 'react-hook-form';
import { register as registerUser, RegisterData } from '../../lib/auth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterData>();
  const router = useRouter();

  const onSubmit = async (data: RegisterData) => {
    await registerUser(data);
    router.push('/login');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto flex flex-col gap-4">
      <input placeholder="Kullanıcı Adı" {...register('username')} className="border p-2" />
      <input placeholder="Email" {...register('email')} className="border p-2" />
      <input type="password" placeholder="Şifre" {...register('password')} className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Kayıt Ol</button>
    </form>
  );
}
