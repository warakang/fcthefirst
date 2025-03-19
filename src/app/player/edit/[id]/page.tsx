'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Player {
  id: number;
  name: string;
  position: string;
  grade: string;
}

export default function PlayerEdit({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('ATTACK');
  const [grade, setGrade] = useState('A');

  useEffect(() => {
    fetchPlayer();
  }, []);

  const fetchPlayer = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (data) {
      setPlayer(data);
      setName(data.name);
      setPosition(data.position);
      setGrade(data.grade);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('players')
      .update({ 
        name: name.trim(), 
        position,
        grade 
      })
      .eq('id', params.id);
    
    if (error) {
      alert('선수 정보 수정에 실패했습니다.');
      return;
    }

    alert('선수 정보가 수정되었습니다.');
    router.push('/player/list');
  };

  if (!player) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">선수 정보 수정</h1>
          <Link 
            href="/player/list"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            뒤로가기
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="선수 이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                포지션
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="ATTACK">공격</option>
                <option value="MIDFIELD">미드필드</option>
                <option value="DEFENSE">수비</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                등급
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="A">A등급</option>
                <option value="B">B등급</option>
                <option value="C">C등급</option>
                <option value="D">D등급</option>
                <option value="E">E등급</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                수정하기
              </button>
              <Link
                href="/player/list"
                className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition text-center"
              >
                취소
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 