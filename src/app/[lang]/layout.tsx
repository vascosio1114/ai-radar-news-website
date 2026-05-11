import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SUPPORTED_LANGS, DEFAULT_LANG } from "@/lib/site";

type Props = { children: React.ReactNode; params: { lang: string } };

export default function LangLayout({ children, params }: Props) {
  if (!SUPPORTED_LANGS.includes(params.lang as (typeof SUPPORTED_LANGS)[number])) {
    redirect(`/${DEFAULT_LANG}`);
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}