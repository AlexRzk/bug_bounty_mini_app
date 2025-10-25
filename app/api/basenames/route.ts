import { NextResponse } from "next/server"
import { createPublicClient, http, getAddress, Address } from "viem"
import { base } from "viem/chains"
import { resolveBasename, BASENAME_UNIVERSAL_RESOLVER } from "@/lib/basename"

interface GraphRegistration {
  labelName: string
  registrant: string
  registrationTime: string
}

async function fetchFromGraph(): Promise<Array<{ basename: string; address: string }>> {
  const endpoint = process.env.BASENAME_GRAPHQL_ENDPOINT ??
    "https://api.studio.thegraph.com/query/49446/basename-base/v0.0.4"

  const query = `{
    registrations(first: 40, orderBy: registrationTime, orderDirection: desc) {
      labelName
      registrant
      registrationTime
    }
  }`

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "BugBountyMiniApp/1.0",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    })

    if (!res.ok) throw new Error("Graph request failed")
    const json = await res.json()
    const registrations: GraphRegistration[] = json?.data?.registrations ?? []
    return registrations
      .filter((r) => !!r.labelName && !!r.registrant)
      .map((r) => ({
        basename: `${r.labelName.toLowerCase()}.base.eth`,
        address: r.registrant,
      }))
  } catch (error) {
    return []
  }
}

// Fallback: scrape html if graph unavailable
function extractBasenames(html: string): string[] {
  const matches = html.match(/([a-z0-9-]+\.base\.eth)/gi) || []
  const seen = new Set<string>()
  const result: string[] = []
  for (const m of matches) {
    const lower = m.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      result.push(lower)
    }
  }
  return result
}

async function fetchFromWebsite(): Promise<string[]> {
  try {
    const res = await fetch("https://www.base.org/names", {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; BugBountyMiniApp/1.0)",
        accept: "text/html,application/xhtml+xml",
      },
    })
    if (!res.ok) throw new Error("names page fetch failed")
    const html = await res.text()
    return extractBasenames(html)
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const client = createPublicClient({ chain: base, transport: http() })

    const directRecords = await fetchFromGraph()
    let candidateNames: Array<{ basename: string; address: string }> = directRecords

    // If graph failed or empty, fall back to scraping
    if (candidateNames.length === 0) {
      const scraped = await fetchFromWebsite()
      candidateNames = scraped.map((name) => ({ basename: name, address: "" }))
    }

    const out: Array<{ basename: string; address: string }> = []

    for (const entry of candidateNames) {
      const name = entry.basename
      try {
        const rawAddress = entry.address
          ? entry.address
          : await client.getEnsAddress({
              name,
              universalResolverAddress: BASENAME_UNIVERSAL_RESOLVER,
            })

        if (!rawAddress) continue

        let checksum: Address
        try {
          checksum = getAddress(rawAddress)
        } catch {
          continue
        }
        const reverse = await resolveBasename(client, checksum)
        if (!reverse) continue
        if (reverse.toLowerCase() !== name.toLowerCase()) continue

        out.push({ basename: reverse, address: checksum })
        if (out.length >= 30) break
      } catch {
        // ignore individual failures
      }
    }

    return NextResponse.json({ count: out.length, records: out })
  } catch (error) {
    return NextResponse.json({ count: 0, records: [], error: "failed_to_fetch" }, { status: 200 })
  }
}
