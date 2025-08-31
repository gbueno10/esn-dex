'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthGate';
import { cn } from '@/lib/utils';
import { Users, Trophy, User } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();
  const { userRole } = useAuth();

  const navigationItems = [
    {
      name: 'Profiles',
      href: '/esners',
      icon: Users,
    },
    {
      name: 'Challenges',
      href: '/challenges',
      icon: Trophy,
    },
    {
      name: 'My Profile',
      href: '/me',
      icon: User,
      esnnerOnly: true, // Apenas para ESNers
    },
  ];

  // Filtrar itens baseado no papel do usuário
  const filteredItems = navigationItems.filter(item => {
    if (item.esnnerOnly) return userRole === 'esnner';
    return true; // Mostrar para todos
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around h-16 px-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
