import { DocumentDetailsView } from "../../../../components/document-details-view";

export default async function DocumentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocumentDetailsView id={id}/>;
}
