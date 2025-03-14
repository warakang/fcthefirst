'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    
    if (newCount === 5) {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1004') {
      window.location.href = '/admin';
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">FC</span>
          <span className="ml-2">더퍼스트</span>
        </h1>
        <p className="text-xl text-gray-600 uppercase tracking-wider">TEAM MANAGER</p>
      </div>

      <div className="relative mb-12 group" onClick={handleLogoClick}>
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
        <Image
          src="/logo.png"
          alt="FC THE FIRST"
          width={180}
          height={180}
          className="relative rounded-full shadow-lg"
        />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-[280px]">
        <Link 
          href="/team-maker" 
          className="bg-gradient-to-r from-primary to-red-600 text-white py-4 px-8 rounded-xl text-center font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 text-lg"
        >
          팀 짜기
        </Link>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        v1.0.0
      </div>

      {/* 비밀번호 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900">관리자 인증</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full p-4 border border-gray-300 rounded-xl text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setLogoClicks(0);
                    setPassword('');
                    setError('');
                  }}
                  className="flex-1 p-4 border border-gray-300 text-gray-700 rounded-xl
                           hover:bg-gray-50 transition-colors font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 p-4 bg-[#FF3B30] text-white rounded-xl
                           hover:bg-[#E5352B] transition-colors font-bold"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
