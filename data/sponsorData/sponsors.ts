export type SponsorItem = {
  id: string;
  name: string;
  label: string;
  logo: string;
  video: string;
  poster: string;
  website?: string;
  isActive: boolean;
};

export const sponsors: SponsorItem[] = [
  {
    id: "sponsor-1",
    name: "Sponsor Name 1",
    label: "Leylix Sponsor",
    logo: "/sponsors/sponsor-1/logo.png",
    video: "/sponsors/sponsor-1/preview.mp4",
    poster: "/sponsors/sponsor-1/poster.jpg",
    website: "https://example.com",
    isActive: true,
  },
  {
    id: "sponsor-2",
    name: "Sponsor Name 2",
    label: "Leylix Sponsor",
    logo: "/sponsors/sponsor-2/logo.png",
    video: "/sponsors/sponsor-2/preview.mp4",
    poster: "/sponsors/sponsor-2/poster.jpg",
    website: "https://example.com",
    isActive: true,
  },
];