import type { Metadata } from "next";
import { Container, Pill, Title } from "@/components/ui";
import { registry } from "@/lib/content";

export const metadata: Metadata = {
  title: "Name Registry",
  description: "Search the registered names and see which flag each one is honored on.",
};

export default function NameRegistryPage() {
  return (
    <Container className="pb-24 pt-14 sm:pt-20">
      <Title plain="Name" accent="Registry" rule={false} />
      <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-ink-2 sm:text-lg">
        <p>When viewing on your desktop you can filter by:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Branch</li>
          <li>Cause of Death</li>
          <li>Flag Number</li>
        </ul>
        <p>The easiest way to find a name is to click the magnifying glass and type the name in.</p>
        <p>{registry.text[1]}</p>
      </div>
      <div className="mt-6">
        <Pill href={registry.openUrl} newTab>Open the registry full screen</Pill>
      </div>
      <div className="mt-8 overflow-hidden rounded-[12px] border border-line">
        <iframe src={registry.embedUrl} title="Flag to Remember Name Registry (Airtable)" loading="lazy" className="block h-[75svh] min-h-[32rem] w-full" />
      </div>
    </Container>
  );
}
