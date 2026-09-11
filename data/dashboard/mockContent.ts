import type { Page, Section } from "@/types/content";

export const mockPages: Page[] = [
  { id: "home", slug: "home", title: "Home", status: "Published", sectionsCount: 10, lastEdited: "2 hours ago" },
  { id: "about", slug: "about-us", title: "About Us", status: "Published", sectionsCount: 4, lastEdited: "Yesterday" },
  { id: "services", slug: "services", title: "Services", status: "Published", sectionsCount: 5, lastEdited: "3 days ago" },
  { id: "portfolio", slug: "portfolio", title: "Portfolio", status: "Draft", sectionsCount: 3, lastEdited: "1 week ago" },
  { id: "contact", slug: "contact", title: "Contact", status: "Published", sectionsCount: 2, lastEdited: "2 weeks ago" },
  { id: "blog", slug: "blog", title: "Blog", status: "Draft", sectionsCount: 1, lastEdited: "3 weeks ago" },
];

const homeSections: Section[] = [
  {
    id: "hero",
    type: "Hero",
    title: "Hero Banner",
    visible: true,
    order: 1,
    content: {
      headline: "File Your Taxes In Just 1 Day",
      subtitle: "Online Tax Filing Portal",
      description: "Fast, secure, and guided filing for individuals and businesses.",
      primaryCtaText: "Get started",
      secondaryCtaText: "Learn more",
      stats: [
        { label: "Happy clients", value: "12k+" },
        { label: "Average filing time", value: "1 day" },
      ],
      backgroundImage: "hero-banner.jpg",
    },
  },
  {
    id: "services",
    type: "Services",
    title: "Our Services",
    visible: true,
    order: 2,
    content: {
      services: [
        { icon: "💼", title: "Personal tax filing", description: "Easy filing for individuals" },
        { icon: "🏢", title: "Business returns", description: "Scale your business with expert support" },
      ],
    },
  },
  {
    id: "why",
    type: "About",
    title: "Why FilerNow",
    visible: true,
    order: 3,
    content: {
      heading: "Why FilerNow",
      body: "Trusted by users who want accuracy and speed.",
    },
  },
  {
    id: "who",
    type: "About",
    title: "Who We Are",
    visible: true,
    order: 4,
    content: {
      heading: "Who We Are",
      body: "We help people file confidently from anywhere.",
    },
  },
  {
    id: "how",
    type: "Video",
    title: "How It Works",
    visible: true,
    order: 5,
    content: {
      heading: "How It Works",
      videoUrl: "https://example.com/how-it-works",
      caption: "See the filing journey in 90 seconds.",
    },
  },
  {
    id: "faq",
    type: "FAQ",
    title: "FAQ",
    visible: true,
    order: 6,
    content: {
      faqs: [
        { question: "Do I need an accountant?", answer: "No, our guide walks you through it." },
      ],
    },
  },
  {
    id: "reviews",
    type: "Reviews",
    title: "Testimonials",
    visible: true,
    order: 7,
    content: {
      testimonials: [
        { name: "Ava", role: "Founder", quote: "It felt effortless.", avatar: "ava.png" },
      ],
    },
  },
  {
    id: "blog",
    type: "Blog",
    title: "Recent Blogs",
    visible: true,
    order: 8,
    content: {
      heading: "Recent Blogs",
      intro: "Helpful updates and tax tips.",
    },
  },
  {
    id: "cta",
    type: "CTA",
    title: "Call to Action",
    visible: true,
    order: 9,
    content: {
      headline: "Ready to file?",
      subtext: "Start now in minutes.",
      buttonText: "Start filing",
      buttonLink: "/signup",
    },
  },
  // {
  //   id: "footer",
  //   type: "Footer",
  //   title: "Footer",
  //   visible: true,
  //   order: 10,
  //   content: {
  //     columns: [{ heading: "Product", links: [{ label: "Features", href: "/features" }] }],
  //     socialLinks: [{ label: "Instagram", href: "https://instagram.com" }],
  //     copyrightText: "© 2026 FilerNow",
  //   },
  // },
];

export const mockSectionsByPage: Record<string, Section[]> = {
  home: homeSections,
  "about-us": [
    {
      id: "about-1",
      type: "About",
      title: "About Hero",
      visible: true,
      order: 1,
      content: { heading: "About Us", body: "We are a modern tax platform." },
    },
  ],
  services: [
    {
      id: "services-1",
      type: "Services",
      title: "Services Intro",
      visible: true,
      order: 1,
      content: { services: [{ icon: "🧾", title: "Tax prep", description: "Choose the plan you need" }] },
    },
  ],
  portfolio: [
    {
      id: "portfolio-1",
      type: "Hero",
      title: "Portfolio Hero",
      visible: true,
      order: 1,
      content: { headline: "Our Work", subtitle: "Sample portfolio" },
    },
  ],
  contact: [
    {
      id: "contact-1",
      type: "CTA",
      title: "Contact CTA",
      visible: true,
      order: 1,
      content: { headline: "Contact us", subtext: "We reply within a day.", buttonText: "Email us", buttonLink: "/contact" },
    },
  ],
  blog: [
    {
      id: "blog-1",
      type: "Blog",
      title: "Blog Intro",
      visible: true,
      order: 1,
      content: { heading: "Latest Articles", intro: "Read our insights" },
    },
  ],
};
