import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | LINK Translations',
  description: 'Sign in to access your LINK Translations portal.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Login page has its own design without header/footer
  return <>{children}</>
}
