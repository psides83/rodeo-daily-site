import type { Metadata } from "next";
import { NewsAdminEditor } from "./news-admin-editor";

export const metadata: Metadata = {
  title: "News Admin | Rodeo Daily",
  robots: {
    index: false,
    follow: false
  }
};

export default function NewsAdminPage() {
  return <NewsAdminEditor />;
}
