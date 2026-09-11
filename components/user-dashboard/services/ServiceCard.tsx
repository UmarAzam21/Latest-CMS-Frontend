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
            href={href}
            className={cn(
                "flex flex-col items-center justify-center text-center gap-3 rounded-brand-8 border border-border-clr py-3 px-2 bg-page-bg default-transition hover:-translate-y-0.5 hover:shadow-card-hover group",
                highlighted
                    ? "border-primary/20 shadow-service-card"
                    : "border-border-clr hover:border-primary/15",
            )}
        >
            <span
                className={cn("flex items-center justify-center w-[50px] h-[50px] rounded-full bg-primary-lighter group-hover:scale-110 default-transition"
                )}>
                <Image
                    src={icon}
                    alt={label}
                    width={25}
                    height={25}
                />
            </span>

            <p
                className={cn(
                    "para-tiny font-medium group-hover:text-primary default-transition", highlighted ? "text-primary font-semibold" : "text-text-secondary"
                )}>
                {label}
            </p>
        </Link>
    )
}

export default ServiceCard