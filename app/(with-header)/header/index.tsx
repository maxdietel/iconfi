import { AuthButton } from "@/components/auth-button"
import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b border-b-border">
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center py-2 px-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="iConFi Logo"
            width={64}
            height={64}
            className="object-contain"
            />
        </Link>

        {/* <HeaderNav /> */}

        <AuthButton />
      </div>
    </header>
  )
}