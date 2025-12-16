import { Header } from "./header";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex grow flex-col max-w-5xl mx-auto w-full px-5 py-12">
        {children}
      </div>
    </main>
  );
}
