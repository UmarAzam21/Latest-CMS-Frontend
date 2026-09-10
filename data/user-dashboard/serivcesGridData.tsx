// data/appData.tsx — IServiceItem + servicesGridData, category field added
export interface IServiceItem {
    id: string,
    label: string,
    icon: string,
    href: string,
    category: 'registration' | 'compliance' | 'licenses',
    highlighted?: boolean,
}

export const servicesGridData: IServiceItem[] = [
    {
        id: "svc1",
        label: "Business NTN",
        icon: "/assets/services/service1.svg",
        href: "/services/business-ntn-registration",
        category: "registration",
        // highlighted: true
    },

    {
        id: "svc2",
        label: "Simple NTN Registration",
        icon: "/assets/services/service2.svg",
        href: "/services/service-simple-ntn-registration-2",
        category: "registration"
    },

    {
        id: "svc3",
        label: "Business Registration",
        icon: "/assets/services/service3.svg",
        href: "/services/business-registration-pakistan",
        category: "registration"
    },

    {
        id: "svc4",
        label: "Company Registration",
        icon: "/assets/services/service4.svg",
        href: "/services/company-registration-pakistan",
        category: "registration"
    },

    {
        id: "svc5",
        label: "Filer Registration",
        icon: "/assets/services/service5.svg",
        href: "/services/service-filer-registration",
        category: "registration"
    },

    {
        id: "svc8",
        label: "GST Registration",
        icon: "/assets/services/service8.svg",
        href: "/services/service-gst-registration",
        category: "registration"
    },

    {
        id: "svc6",
        label: "Tax Return Filing",
        icon: "/assets/services/service6.svg",
        href: "/services/service-tax-return-filing",
        category: "compliance"
    },

    {
        id: "svc15",
        label: "FBR Notices",
        icon: "/assets/services/service15.svg",
        href: "/services/service-fbr-notices",
        category: "compliance"
    },

    {
        id: "svc16",
        label: "Wealth Statement",
        icon: "/assets/services/service16.svg",
        href: "/services/service-wealth-statement",
        category: "compliance"
    },

    {
        id: "svc14",
        label: "DTS Registration",
        icon: "/assets/services/service14.svg",
        href: "/services/service-dts-registration",
        category: "compliance"
    },

    {
        id: "svc7",
        label: "Imp & Exp License (PSW)",
        icon: "/assets/services/service7.svg",
        href: "/services/service-imp-exp-license-psw",
        category: "licenses"
    },

    {
        id: "svc9",
        label: "Trade Mark Registration",
        icon: "/assets/services/service9.svg",
        href: "/services/service-trade-mark-registration",
        category: "licenses"
    },

    {
        id: "svc12",
        label: "PEC Registration",
        icon: "/assets/services/service12.svg",
        href: "/services/service-pec-registration",
        category: "licenses"
    },

    {
        id: "svc13",
        label: "Chamber Membership",
        icon: "/assets/services/service13.svg",
        href: "/services/chamber-membership-registration",
        category: "licenses"
    },

    {
        id: "svc11",
        label: "PSEB",
        icon: "/assets/services/service11.svg",
        href: "/services/service-pseb",
        category: "licenses"
    },

    {
        id: "svc10",
        label: "DNFBP",
        icon: "/assets/services/service10.svg",
        href: "/services/service-dnfbp",
        category: "licenses"
    },

]