import { SignUpForm } from "@/components/sign-up-form"
import Link from "next/link"
import Image from "next/image"
import studentImage from "@/assets/student.jpg"

export default function SignUpPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="#">
            <Image
              src="/logo.png"
              alt="iConFi Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={studentImage}
          fill={true}
          alt="Student studying"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
