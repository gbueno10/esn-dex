'use client';

import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/components/AuthGate";

interface ConditionalAppLayoutProps {
  children: React.ReactNode;
}

export function ConditionalAppLayout({ children }: ConditionalAppLayoutProps) {
  const { user } = useAuth();

  // Se for usuário anônimo ou não logado, não mostra o layout com header/navigation
  if (!user || user.isAnonymous) {
    return <>{children}</>;
  }

  // Para usuários logados (ESNers), mostra o layout completo
  return <AppLayout>{children}</AppLayout>;
}
