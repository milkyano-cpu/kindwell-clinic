import Image from "next/image";
import Link from "next/link";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-[#6E78FF]">
        <div className="container mx-auto flex justify-center items-center px-4 py-5">
          <Link href="/" aria-label="Go to homepage">
            <Image src="/kindwell-white.png" alt="Kindwell Clinic" width={160} height={40} priority />
          </Link>
        </div>
      </header>
      {children}
    </>
  );
}