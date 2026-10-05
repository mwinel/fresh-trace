import { ExistingSample } from "@/features/samples/components/existing-sample-page"
export default async function ExistingSamplePage({
  params,
}: {
  params: Promise<{ sampleId: string }>
}) {
  const { sampleId } = await params
  return <ExistingSample sampleId={sampleId} />
}
