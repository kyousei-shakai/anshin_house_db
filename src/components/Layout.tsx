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
      <main className="min-h-screen flex flex-col items-center">
        {children}
      </main>
    </>
  )
}