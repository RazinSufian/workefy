"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          Workefy
        </Link>
        <div className="space-x-4">
          {session ? (
            <>
              {session.user.role === 'admin' && (
                <Link href="/admin/dashboard" className="text-gray-300 hover:text-white">
                  Admin Dashboard
                </Link>
              )}
              {session.user.role === 'worker' && (
                <Link href="/worker/dashboard" className="text-gray-300 hover:text-white">
                  Worker Dashboard
                </Link>
              )}
              {session.user.role === 'client' && (
                <Link href="/client/dashboard" className="text-gray-300 hover:text-white">
                  Client Dashboard
                </Link>
              )}
              <button onClick={() => signOut()} className="text-gray-300 hover:text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
              <Link href="/auth/register" className="text-gray-300 hover:text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
