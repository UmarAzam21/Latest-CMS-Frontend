import { cn } from "@/lib/cn"
import Image from "next/image"
import Link from "next/link"

type Props = {
    label: string,
    icon: string,
    href: string,
    highlighted?: boolean,
}

const ServiceCard = ({ label, icon, href, highlighted }: Props) => {
    return (
        <Link
            href={`/user-dashboard?tab=inbox&service=${encodeURIComponent(label)}`}
            className={cn(
                "flex flex-col items-center justify-center text-center gap-2 rounded-brand-8 border border-border-clr p-2 bg-page-bg default-transition hover:-translate-y-0.5 hover:shadow-card-hover group",
                highlighted
                    ? "border-primary/20 shadow-service-card"
                    : "border-border-clr hover:border-primary/15",
            )}
        >
            <span
                className={cn("flex items-center justify-center w-[35px] h-[35px] rounded-full bg-primary-lighter group-hover:scale-110 default-transition"
                )}>
                <Image
                    src={icon}
                    alt={label}
                    width={20}
                    height={20}
                />
            </span>

            <p
                className={cn(
                    "para-tiny text-[10px] font-medium group-hover:text-primary default-transition", highlighted ? "text-primary font-semibold" : "text-text-secondary"
                )}>
                {label}
            </p>
        </Link>
    )
}

export default ServiceCard