interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return <div className="relative flex overflow-hidden pb-2">{children}</div>
}
