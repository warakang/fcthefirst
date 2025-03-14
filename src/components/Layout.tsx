export default function Layout({ children, title }: { children: React.ReactNode, title?: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
      {/* 우측 하단 그라데이션 효과 */}
      <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-[#FF3B30]/20 via-[#FF6B52]/10 to-transparent rounded-tl-full"></div>
      
      {title && (
        <div className="text-center mt-8 mb-6 relative z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF3B30] to-[#FF6B52] text-transparent bg-clip-text">
            {title}
          </h1>
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10 p-6">
        {children}
      </div>

      {/* 추가 장식 효과 */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#FF3B30]/5 to-transparent rounded-full blur-xl"></div>
      <div className="absolute top-40 right-10 w-16 h-16 bg-gradient-to-bl from-[#FF6B52]/5 to-transparent rounded-full blur-xl"></div>
    </main>
  );
} 