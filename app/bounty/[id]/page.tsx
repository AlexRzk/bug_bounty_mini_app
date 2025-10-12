import { BountyDetail } from "@/components/bounty-detail"
import { Header } from "@/components/header"

export default async function BountyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BountyDetail bountyId={id} />
      </main>
    </div>
  )
}
