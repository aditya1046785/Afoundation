import type { Metadata } from "next";
import CertificateGenerator from "@/components/Certificate/CertificateGenerator";

export const metadata: Metadata = {
  title: "Generate Certificate | Admin Dashboard",
};

export default function NewCertificatePage() {
  return <CertificateGenerator />;
}
