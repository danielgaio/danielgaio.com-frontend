import Image from "next/image";

export function Icon({ name = "arrow-up-right" }: { name?: "arrow-up-right" | "arrow-right" | "arrow-left" | "menu" | "x" }) {
  return <Image className="icon" src={`/media/icons/${name}.svg`} width={24} height={24} alt="" aria-hidden="true" unoptimized />;
}
