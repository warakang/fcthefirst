'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">관리자 페이지</h1>
          <Link 
            href="/"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            뒤로가기
          </Link>
        </div>

        <div className="space-y-4">
          <Link 
            href="/player/register"
            className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold mb-2">선수 등록</h2>
            <p className="text-gray-600">새로운 선수를 등록합니다</p>
          </Link>

          <Link 
            href="/player/list"
            className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold mb-2">선수 목록</h2>
            <p className="text-gray-600">등록된 선수 목록을 확인합니다</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 