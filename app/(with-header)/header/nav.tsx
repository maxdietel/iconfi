"use client"

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { useIsMobile } from "@/lib/hooks"
import Link from "next/link"
import { FC } from "react"

export const HeaderNav: FC = () => {
  const isMobile = useIsMobile()

  return (
    <NavigationMenu viewport={isMobile}>
    <NavigationMenuList className="flex-wrap">
      <NavigationMenuItem>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
          <Link href="/topics">Themen</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
  )
}