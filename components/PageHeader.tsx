"use client";

import Image from "next/image";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  buttonLabel?: string;
  buttonHref?: string;
  logoUrl?: string;
}

export default function PageHeader({
  title,
  buttonLabel,
  buttonHref,
  logoUrl = "https://ninjau.com/wp-content/uploads/2018/09/ninja-u-mobile-logo.png",
}: PageHeaderProps) {
  return (
    <div className="relative">
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
        <Image src={logoUrl} alt="NinjaU Logo" width={128} height={128} />
        <h1 className="text-3xl font-bold text-[#FFE933] whitespace-nowrap">
          {title}
        </h1>
      </div>
    </div>
  );
}
