// src/components/Layout.tsx

import Header from './Header'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </>
  )
}