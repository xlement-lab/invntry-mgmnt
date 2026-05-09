'use client'

export default function DemoEndedOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo Has Ended</h1>
          <p className="text-gray-500 text-sm">
            Thank you for trying LightAudit Pro. This demo is no longer available.
          </p>
        </div>
      </div>
    </div>
  )
}
