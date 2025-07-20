"use client";

import Image from "next/image";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  buttonLabel?: string;
  buttonHref?: string;
  logoUrl?: string;
  isAdmin?: boolean;  // optional boolean prop
}

export default function PageHeader({
  title,
  buttonLabel,
  buttonHref,
  logoUrl = "https://ninjau.com/wp-content/uploads/2018/09/ninja-u-mobile-logo.png",
  isAdmin = false,  // default false
}: PageHeaderProps) {
  return (
    <div className="relative">
     {isAdmin && (
      <div className="absolute top-2 left-2 z-50">
        <Link
          href="/create"
          aria-label="Add Competition"
          className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 text-black font-bold hover:bg-yellow-500"
        >
          +
        </Link>
      </div>
     )}
      {/* Top-right Button */}
      {buttonLabel && buttonHref && (
        <div className="sticky top-0 right-0 z-10 flex justify-end p-2">
          <Link
            href={buttonHref}
            className="text-sm bg-gray-500 px-3 py-1 rounded hover:bg-gray-700 text-[#FFD700]"
          >
            {buttonLabel}
          </Link>
        </div>
      )}

      {/* Centered Logo + Title */}
      <div className="flex items-center justify-center mb-6 gap-4">
        <Image src={logoUrl} alt="NinjaU Logo" width={128} height={128} priority/>
        <h1 className="text-3xl font-bold text-[#FFE933] whitespace-nowrap">
          {title}
        </h1>
      </div>
    </div>
  );
}
