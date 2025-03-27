'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import html2canvas from 'html2canvas';

interface Player {
  id: number;
  name: string;
  position: string;
  grade: string;
  selected?: boolean;
}

interface Guest {
  id: string;
  name: string;
  grade: string;
}

// 새로운 인터페이스 추가
interface Participant {
  id: string;
  name: string;
  grade: string;
  displayGrade: string;
  isGuest: boolean;
}

export default function TeamMaker() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showTeamResult, setShowTeamResult] = useState(false);
  const [guestName, setGuestName] = useState<string>('');
  const [guestGrade, setGuestGrade] = useState<string>('계속참');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [teamCount, setTeamCount] = useState<number>(2);
  const [shuffleCount, setShuffleCount] = useState<number>(0);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('name');
    if (data) {
      // 한글 이름 기준으로 정렬
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      setPlayers(sortedData);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayers([...selectedPlayers, player]);
    setPlayers(players.filter(p => p.id !== player.id));
  };

  const handleUnselectPlayer = (player: Player) => {
    setPlayers([...players, player]);
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
  };

  const addGuest = () => {
    if (!guestName.trim()) {
      alert('게스트 이름을 입력해주세요.');
      return;
    }

    const newGuest: Guest = {
      id: Date.now().toString(),
      name: guestName.trim(),
      grade: guestGrade
    };

    setGuests([...guests, newGuest]);
    setGuestName('');
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter(guest => guest.id !== id));
  };

  const handleMakeTeam = () => {
    if (selectedPlayers.length + guests.length < teamCount) {
      alert(`최소 ${teamCount}명 이상의 선수/게스트를 선택해주세요.`);
      return;
    }
    setShowTeamResult(true);
  };

  // 팀 분배 함수
  const distributeTeams = (): Participant[][] => {
    // 게스트 등급 매핑 (계속참 -> C, 오랫만 -> E)
    const mapGuestGrade = (grade: string) => {
      if (grade === '계속참') return 'C';
      if (grade === '오랜만') return 'E';
      return grade;
    };

    // 참가자가 없는 경우 빈 배열 반환
    if (selectedPlayers.length + guests.length === 0) {
      return Array.from({ length: teamCount }, () => []);
    }

    let allParticipants: Participant[] = [
      ...selectedPlayers.map(p => ({ 
        id: p.id.toString(), 
        name: p.name, 
        grade: p.grade, 
        displayGrade: p.grade, 
        isGuest: false 
      })),
      ...guests.map(g => ({ 
        id: g.id, 
        name: g.name, 
        grade: mapGuestGrade(g.grade),
        displayGrade: g.grade,
        isGuest: true 
      }))
    ];
    
    // 등급 기준으로 정렬 (A가 가장 높은 등급)
    allParticipants.sort((a, b) => {
      if (a.grade < b.grade) return -1;
      if (a.grade > b.grade) return 1;
      return 0;
    });
    
    // 섞기 횟수에 따라 같은 등급 내에서 플레이어 순서를 랜덤하게 섞기
    if (shuffleCount > 0) {
      // 등급별로 참가자 그룹화
      const participantsByGrade: { [key: string]: Participant[] } = {};
      
      allParticipants.forEach(participant => {
        if (!participantsByGrade[participant.grade]) {
          participantsByGrade[participant.grade] = [];
        }
        participantsByGrade[participant.grade].push(participant);
      });
      
      // 각 등급 내에서 참가자 섞기
      Object.keys(participantsByGrade).forEach(grade => {
        participantsByGrade[grade] = shuffleArray(participantsByGrade[grade]);
      });
      
      // 섞인 참가자들을 다시 하나의 배열로 합치기
      allParticipants = Object.keys(participantsByGrade)
        .sort() // 등급 순서대로 정렬 (A, B, C, ...)
        .flatMap(grade => participantsByGrade[grade]);
    }
    
    const teams: Participant[][] = Array.from({ length: teamCount }, () => []);
    
    // 스네이크 드래프트 방식으로 팀 분배
    allParticipants.forEach((participant, index) => {
      const teamIndex = index % teamCount;
      teams[teamIndex].push(participant);
    });
    
    return teams;
  };
  
  // 배열을 랜덤하게 섞는 함수
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // 팀 섞기 함수
  const shuffleTeams = () => {
    setShuffleCount(prev => prev + 1);
  };
  
  // shuffleCount가 변경될 때마다 teams 재계산
  const teams = distributeTeams();

  // 팀 결과를 이미지로 저장하는 함수
  const saveAsImage = async () => {
    if (!resultRef.current) return;
    
    try {
      // 로딩 표시
      alert('이미지를 생성 중입니다...');
      
      // 폰트 로딩 완료 확인을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // html2canvas를 사용하여 DOM 요소를 캡처
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // 고해상도를 위해 스케일 조정
        useCORS: true, // 외부 리소스 허용
        allowTaint: true, // 외부 리소스 허용
        logging: false, // 로그 비활성화
        windowHeight: resultRef.current.scrollHeight + 20, // 스크롤 높이 기준으로 설정
      });
      
      // 캔버스를 이미지로 변환
      const image = canvas.toDataURL('image/png');
      
      // 다운로드 링크 생성
      const link = document.createElement('a');
      link.href = image;
      link.download = `팀구성결과_${new Date().toISOString().split('T')[0]}.png`;
      
      // 다운로드 링크 클릭
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('이미지 저장 중 오류 발생:', error);
      alert('이미지 저장에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">팀 짜기</h1>
          <div className="flex items-center gap-4">
            <span className="bg-white px-4 py-2 rounded-lg shadow">
              선택된 인원: {selectedPlayers.length + guests.length}명
            </span>
            <Link 
              href="/"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              뒤로가기
            </Link>
          </div>
        </div>

        {/* 선택된 선수 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">선택된 선수</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">팀 수:</span>
              <select
                value={teamCount}
                onChange={(e) => setTeamCount(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg"
              >
                <option value={2}>2팀</option>
                <option value={3}>3팀</option>
                <option value={4}>4팀</option>
              </select>
            </div>
          </div>
          
          {selectedPlayers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">선택된 선수가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedPlayers.map((player) => (
                <div 
                  key={player.id} 
                  className="bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <span>{player.name}</span>
                  <button 
                    onClick={() => handleUnselectPlayer(player)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 선수 선택 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">선수 선택</h2>
          
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-4">모든 선수가 선택되었습니다.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-6">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player)}
                  className="bg-gray-100 hover:bg-gray-200 px-2 py-2 rounded-lg transition text-center w-full text-sm"
                >
                  {player.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 추가된 게스트 목록 */}
        {guests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h3 className="text-xl font-bold mb-4">추가된 게스트</h3>
            <div className="flex flex-wrap gap-2">
              {guests.map((guest) => (
                <div 
                  key={guest.id} 
                  className="bg-blue-50 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <span>{guest.name} ({guest.grade})</span>
                  <button 
                    onClick={() => removeGuest(guest.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 게스트 추가 섹션 - 맨 아래로 이동 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">게스트 추가</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="게스트 이름"
              />
            </div>
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">등급</label>
              <select
                value={guestGrade}
                onChange={(e) => setGuestGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="계속참">계속참</option>
                <option value="오랜만">오랜만</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addGuest}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto"
              >
                추가
              </button>
            </div>
          </div>
        </div>

        {/* 팀 생성 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleMakeTeam}
            className="bg-primary text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-red-600 transition"
            disabled={selectedPlayers.length + guests.length < teamCount}
          >
            팀 생성하기
          </button>
        </div>

        {/* 팀 결과 모달 */}
        {showTeamResult && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">팀 구성 결과</h2>
                <div className="flex gap-2">
                  <button
                    onClick={shuffleTeams}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    팀 섞기
                  </button>
                </div>
              </div>
              
              {/* 화면에 표시되는 팀 결과 */}
              <div className="bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {teams.map((team, index) => (
                    <div 
                      key={index} 
                      className={`p-5 rounded-xl ${
                        index === 0 ? 'bg-red-50' : 
                        index === 1 ? 'bg-blue-50' : 
                        index === 2 ? 'bg-green-50' : 
                        'bg-purple-50'
                      }`}
                    >
                      <h3 
                        className={`text-xl font-bold mb-4 ${
                          index === 0 ? 'text-red-600' : 
                          index === 1 ? 'text-blue-600' : 
                          index === 2 ? 'text-green-600' : 
                          'text-purple-600'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}팀
                      </h3>
                      <ul className="space-y-2">
                        {team.map((participant: Participant) => (
                          <li 
                            key={participant.id} 
                            className={`py-2 px-4 ${participant.isGuest ? 'text-blue-600' : ''}`}
                          >
                            <div className="flex justify-between">
                              <span>{participant.name}</span>
                              <span className="invisible">여백 확보</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 이미지 저장용 가로 모드 레이아웃 (화면에는 보이지 않음) */}
              <div 
                ref={resultRef} 
                className="fixed left-[-9999px] top-[-9999px] bg-white" 
                style={{ width: '800px' }}
              >
                <div className="flex flex-row">
                  {teams.map((team, index) => (
                    <div 
                      key={index} 
                      className={`p-3 ${
                        index === 0 ? 'bg-red-50' : 
                        index === 1 ? 'bg-blue-50' : 
                        index === 2 ? 'bg-green-50' : 
                        'bg-purple-50'
                      }`}
                      style={{ width: `${800 / teams.length}px` }}
                    >
                      <h3 
                        className={`text-lg font-bold mb-2 ${
                          index === 0 ? 'text-red-600' : 
                          index === 1 ? 'text-blue-600' : 
                          index === 2 ? 'text-green-600' : 
                          'text-purple-600'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}팀
                      </h3>
                      <ul className="space-y-1">
                        {team.map((participant: Participant) => (
                          <li 
                            key={participant.id} 
                            className={`py-1 px-2 ${participant.isGuest ? 'text-blue-600' : ''}`}
                          >
                            {participant.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTeamResult(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
                <button
                  onClick={saveAsImage}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-600"
                >
                  이미지로 저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}