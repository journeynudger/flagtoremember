import type { Metadata } from "next";
import { Button, Container, PageHeader } from "@/components/ui";
import { registry } from "@/lib/content";

export const metadata: Metadata = {
  title: "Name Registry",
  description: "Search the registered names and see which flag each one is honored on.",
};

export default function NameRegistryPage() {
  return (
    <>
      <PageHeader eyebrow="Search" title={registry.title} lede={registry.text[0]}>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button href={registry.openUrl}>Open the registry full screen</Button>
          <p className="max-w-md text-sm text-muted">{registry.text[1]}</p>
        </div>
      </PageHeader>
      <Container className="py-10 sm:py-14">
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <iframe
            src={registry.embedUrl}
            title="Flag to Remember Name Registry (Airtable)"
            loading="lazy"
            className="block h-[75svh] min-h-[32rem] w-full"
          />
        </div>
      </Container>
    </>
  );
}
