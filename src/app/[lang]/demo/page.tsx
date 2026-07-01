import type { Metadata } from "next";
import RedesignedDemoPage from "@/app/demo/page";

type Props = { params: { lang: string } };

export const metadata: Metadata = {
  title: "Demo",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LangDemoPage({ params }: Props) {
  return <RedesignedDemoPage />;
}
