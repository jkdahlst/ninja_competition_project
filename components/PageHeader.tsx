"use client";

import Image from "next/image";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  buttonLabel?: string;
  buttonHref?: string;
  logoUrl?: string;
  isAdmin?: boolean;
}

export default function PageHeader({
  title,
  buttonLabel,
  buttonHref,
  logoUrl = "/images/LogoTrans.png",
  isAdmin = false,
}: PageHeaderProps) {
  return (
    <div className="relative">
      {isAdmin && (
        <div className="absolute top-2 left-2 z-50">
          <Link
            href="/create"
            aria-label="Add Competition"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-[#FFF229] font-bold hover:bg-yellow-600"
          >
            +
          </Link>
        </div>
      )}

      {buttonLabel && buttonHref && (
        <div className="absolute top-2 right-2 z-10">
          <Link
            href={buttonHref}
            className="text-sm bg-gray-500 px-3 py-1 rounded hover:bg-gray-700 text-[#FFF229]"
          >
            {buttonLabel}
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-4 text-center sm:text-left">
        <Image src={logoUrl} alt={`${title} logo`} width={128} height={128} priority className="relative top-[6px]"/>
        <h1 className="text-3xl font-bold text-[#FFF229] whitespace-nowrap">{title}</h1>
      </div>
    </div>
  );
}
