'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Player {
  id: number;
  name: string;
  position: string;
  grade: string;
}

export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('name');
    if (data) setPlayers(data);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setPlayers(players.filter(player => player.id !== id));
        alert('선수가 삭제되었습니다.');
      }
    }
  };

  const getPositionText = (position: string) => {
    switch (position) {
      case 'ATTACK': return '공격';
      case 'MIDFIELD': return '미드필드';
      case 'DEFENSE': return '수비';
      default: return position;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">선수 목록</h1>
          <Link 
            href="/admin"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            뒤로가기
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-5 bg-gray-800 text-white p-4">
            <div>이름</div>
            <div>포지션</div>
            <div>등급</div>
            <div className="text-center">수정</div>
            <div className="text-center">삭제</div>
          </div>
          
          {players.map((player) => (
            <div 
              key={player.id}
              className="grid grid-cols-5 p-4 items-center border-b border-gray-100 hover:bg-gray-50"
            >
              <div className="font-medium">{player.name}</div>
              <div className="text-gray-600">{getPositionText(player.position)}</div>
              <div>{player.grade}</div>
              <div className="text-center">
                <Link
                  href={`/player/edit/${player.id}`}
                  className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition inline-block"
                >
                  수정
                </Link>
              </div>
              <div className="text-center">
                <button
                  onClick={() => handleDelete(player.id)}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 