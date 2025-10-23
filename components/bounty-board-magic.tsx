'use client'

import { useState, useRef, useEffect, useCallback } from "react"
import { useReadContract } from "wagmi"
import { formatEther } from "viem"
import { useRouter } from "next/navigation"
import { gsap } from 'gsap'
import { SubmitBountyDialog } from "@/components/submit-bounty-dialog"
import Dock from "@/components/dock"
import { AnimatePresence, motion } from 'framer-motion'
import { VscListFilter, VscWarning, VscFlame, VscInfo } from 'react-icons/vsc'
import './bounty-board-magic.css'

const DEFAULT_PARTICLE_COUNT = 12
const DEFAULT_SPOTLIGHT_RADIUS = 30
const DEFAULT_GLOW_COLOR = '220, 38, 38'
const MOBILE_BREAKPOINT = 768

interface BountyCardData {
  id: string
  title: string
  description: string
  reward: string
  rewardValue: number
  severity: string
  status: string
  creator: string
  deadline: string
  deadlineTs: number
}

const BOUNTY_MANAGER_CONTRACT = {
  address: '0x2b532aB49A441ECDd99A4AB8b02fF33c19997209' as const,
  abi: [
    {
      inputs: [],
      name: "nextBountyId",
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [{ name: "", type: "uint256" }],
      name: "bounties",
      outputs: [
        { name: "id", type: "uint256" },
        { name: "creator", type: "address" },
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "reward", type: "uint256" },
        { name: "severity", type: "uint8" },
        { name: "status", type: "uint8" },
        { name: "winner", type: "address" },
        { name: "createdAt", type: "uint256" },
        { name: "responseCount", type: "uint256" }
      ],
      stateMutability: "view",
      type: "function"
    }
  ] as const
}

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
  const el = document.createElement('div')
  el.className = 'particle'
  el.style.cssText = `
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 10px rgba(${color}, 0.8), 0 0 20px rgba(${color}, 0.4);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `
  return el
}

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
})

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
  const rect = card.getBoundingClientRect()
  const relativeX = ((mouseX - rect.left) / rect.width) * 100
  const relativeY = ((mouseY - rect.top) / rect.height) * 100

  card.style.setProperty('--glow-x', `${relativeX}%`)
  card.style.setProperty('--glow-y', `${relativeY}%`)
  card.style.setProperty('--glow-intensity', glow.toString())
  card.style.setProperty('--glow-radius', `${radius}px`)
}

const ParticleCard: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
}> = ({ children, className = '', onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement[]>([])
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const isHoveredRef = useRef(false)
  const memoizedParticles = useRef<HTMLDivElement[]>([])
  const particlesInitialized = useRef(false)

  // Get the glow color from the card's CSS variable
  const getCardGlowColor = () => {
    if (!cardRef.current) return DEFAULT_GLOW_COLOR
    const computedStyle = window.getComputedStyle(cardRef.current)
    const glowColor = computedStyle.getPropertyValue('--glow-color').trim()
    return glowColor || DEFAULT_GLOW_COLOR
  }

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return

    const { width, height } = cardRef.current.getBoundingClientRect()
    const glowColor = getCardGlowColor()
    memoizedParticles.current = Array.from({ length: DEFAULT_PARTICLE_COUNT }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    )
    particlesInitialized.current = true
  }, [])

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle)
        }
      })
    })
    particlesRef.current = []
  }, [])

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return

    if (!particlesInitialized.current) {
      initializeParticles()
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return

        const clone = particle.cloneNode(true) as HTMLDivElement
        cardRef.current.appendChild(clone)
        particlesRef.current.push(clone)

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        })

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        })
      }, index * 100)

      timeoutsRef.current.push(timeoutId)
    })
  }, [initializeParticles])

  useEffect(() => {
    if (!cardRef.current) return

    const element = cardRef.current

    const handleMouseEnter = () => {
      isHoveredRef.current = true
      animateParticles()
    }

    const handleMouseLeave = () => {
      isHoveredRef.current = false
      clearAllParticles()
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      isHoveredRef.current = false
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      clearAllParticles()
    }
  }, [animateParticles, clearAllParticles])

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>
}> = ({ gridRef }) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null)
  const isInsideSection = useRef(false)

  useEffect(() => {
    if (!gridRef?.current) return

    const spotlight = document.createElement('div')
    spotlight.className = 'global-spotlight'
    spotlight.style.cssText = `
      position: fixed;
      width: 520px;
      height: 520px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${DEFAULT_GLOW_COLOR}, 0.15) 0%,
        rgba(${DEFAULT_GLOW_COLOR}, 0.09) 12%,
        rgba(${DEFAULT_GLOW_COLOR}, 0.05) 22%,
        rgba(${DEFAULT_GLOW_COLOR}, 0.025) 38%,
        rgba(${DEFAULT_GLOW_COLOR}, 0.012) 58%,
        transparent 65%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `
    document.body.appendChild(spotlight)
    spotlightRef.current = spotlight

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return

      const section = gridRef.current.closest('.bento-section')
      const rect = section?.getBoundingClientRect()
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom

      isInsideSection.current = mouseInside || false
      const cards = gridRef.current.querySelectorAll('.bounty-magic-card')

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
        cards.forEach(card => {
          (card as HTMLElement).style.setProperty('--glow-intensity', '0')
        })
        return
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(DEFAULT_SPOTLIGHT_RADIUS)
      let minDistance = Infinity
      let closestCardColor = DEFAULT_GLOW_COLOR

      cards.forEach(card => {
        const cardElement = card as HTMLElement
        const cardRect = cardElement.getBoundingClientRect()
        const centerX = cardRect.left + cardRect.width / 2
        const centerY = cardRect.top + cardRect.height / 2
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2
        const effectiveDistance = Math.max(0, distance)

        if (effectiveDistance < minDistance) {
          minDistance = effectiveDistance
          // Get the card's glow color from computed style
          const computedStyle = window.getComputedStyle(cardElement)
          const cardGlowColor = computedStyle.getPropertyValue('--glow-color').trim()
          if (cardGlowColor) closestCardColor = cardGlowColor
        }

        let glowIntensity = 0
        if (effectiveDistance <= proximity) {
          glowIntensity = 1
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity)
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, DEFAULT_SPOTLIGHT_RADIUS)
      })

      // Update spotlight color to match closest card
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(circle,
          rgba(${closestCardColor}, 0.15) 0%,
          rgba(${closestCardColor}, 0.08) 15%,
          rgba(${closestCardColor}, 0.04) 25%,
          rgba(${closestCardColor}, 0.02) 40%,
          rgba(${closestCardColor}, 0.01) 65%,
          transparent 70%
        )`
      }

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      })

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      isInsideSection.current = false
      gridRef.current?.querySelectorAll('.bounty-magic-card').forEach(card => {
        (card as HTMLElement).style.setProperty('--glow-intensity', '0')
      })
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current)
    }
  }, [gridRef])

  return null
}

export function BountyBoardMagic() {
  const router = useRouter()
  const gridRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("reward")
  const [sortOpen, setSortOpen] = useState<boolean>(false)
  const sortMenuRef = useRef<HTMLDivElement | null>(null)

  // Read the total number of bounties from the contract
  const { data: nextBountyId, isLoading } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: "nextBountyId",
  })

  // Calculate how many bounties exist (fetch up to 50)
  const totalBounties = nextBountyId ? Number(nextBountyId) - 1 : 0
  const maxBounties = Math.min(totalBounties, 50)
  
  // Dynamically create array of bounty IDs to fetch
  const bountyIds = Array.from({ length: maxBounties }, (_, i) => i + 1)
  
  // Fetch all bounties dynamically
  const bountyQueries = bountyIds.map(id => 
    useReadContract({
      ...BOUNTY_MANAGER_CONTRACT,
      functionName: "bounties",
      args: [BigInt(id)],
      query: { enabled: totalBounties >= id },
    })
  )

  // Transform contract data to UI format
  const bounties: BountyCardData[] = bountyQueries
    .map((query, index) => {
      if (!query.data) return null
      
      const [id, creator, title, description, reward, severity, status, winner, createdAt, responseCount] = query.data
      
      // Skip cancelled bounties (status === 2)
      if (Number(status) === 2) return null
      
      // Map contract status enum to UI status
      const statusMap: Record<number, string> = {
        0: "open",
        1: "completed",
      }
      
      // Map severity enum to display string
      const severityMap: Record<number, string> = {
        0: "low",
        1: "medium", 
        2: "high",
        3: "critical"
      }
      
      const rewardValue = Number(formatEther(reward))
      
      return {
        id: id.toString(),
        title: title || "Untitled Bounty",
        description: description || "No description provided",
        reward: `${formatEther(reward)} ETH`,
        rewardValue,
        severity: severityMap[Number(severity)] || "low",
        status: statusMap[Number(status)] || "open",
        creator: creator?.slice(0, 6) + "..." + creator?.slice(-4),
        deadline: new Date(Number(createdAt) * 1000).toLocaleDateString(),
        deadlineTs: Number(createdAt) * 1000,
      }
    })
    .filter((bounty): bounty is BountyCardData => bounty !== null)

  const filteredBounties = bounties.filter((bounty) => {
    if (filter === "all") return true
    if (filter === "critical") return bounty.severity === "critical"
    if (filter === "high") return bounty.severity === "high"
    if (filter === "low") return bounty.severity === "low"
    return true
  })

  const getSeverityColor = (severity: string) => {
    // Returns background color (always dark gray now)
    return '#1a1a1a'
  }

  const getSeverityGlowColor = (severity: string) => {
    // Returns RGB values for glow effect based on severity
    switch (severity) {
      case 'critical': return '220, 38, 38'    // Red
      case 'high': return '245, 158, 11'       // Orange
      case 'medium': return '234, 179, 8'      // Yellow
      case 'low': return '34, 197, 94'         // Green
      default: return '220, 38, 38'            // Default to red
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'rgba(16, 185, 129, 0.2)'
      case 'in-progress': return 'rgba(245, 158, 11, 0.2)'
      case 'completed': return 'rgba(59, 130, 246, 0.2)'
      default: return 'rgba(132, 0, 255, 0.15)'
    }
  }

  const dockItems = [
    { 
      icon: <VscListFilter size={20} />, 
      label: 'All', 
      onClick: () => setFilter('all'),
      className: filter === 'all' ? 'dock-item-active' : ''
    },
    { 
      icon: <VscFlame size={20} />, 
      label: 'Critical', 
      onClick: () => setFilter('critical'),
      className: filter === 'critical' ? 'dock-item-active' : ''
    },
    { 
      icon: <VscWarning size={20} />, 
      label: 'High', 
      onClick: () => setFilter('high'),
      className: filter === 'high' ? 'dock-item-active' : ''
    },
    { 
      icon: <VscInfo size={20} />, 
      label: 'Low', 
      onClick: () => setFilter('low'),
      className: filter === 'low' ? 'dock-item-active' : ''
    },
    { 
      icon: <VscListFilter size={20} />, 
      label: 'Sort', 
      onClick: () => setSortOpen(prev => !prev),
      className: `dock-item-sort ${sortOpen ? 'dock-item-active' : ''}`
    },
  ]

  // Close sort dropdown on route change or when filter changes
  useEffect(() => {
    setSortOpen(false)
  }, [filter])

  // Close sort menu when clicking outside the dropdown and the sort dock item
  useEffect(() => {
    if (!sortOpen) return;

    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const menu = sortMenuRef.current;
      const sortButton = document.querySelector('.dock-item-sort');
      const insideMenu = !!menu && menu.contains(target);
      const insideSortButton = !!sortButton && sortButton.contains(target as Node);
      if (!insideMenu && !insideSortButton) {
        setSortOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSortOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer, { passive: true });
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [sortOpen]);

  // Sort the filtered bounties
  const sortedBounties = [...filteredBounties].sort((a, b) => {
    if (sortBy === 'reward') {
      return b.rewardValue - a.rewardValue
    }
    if (sortBy === 'date') {
      return b.deadlineTs - a.deadlineTs
    }
    // reputation not available yet; keep original order
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-balance text-4xl font-extrabold tracking-tight title-gradient">
            Active Bug Bounties
          </h2>
          <p className="text-pretty mt-2 text-sm font-medium subtitle-muted">
            {isLoading ? "Loading bounties..." : `${filteredBounties.length} active ${filteredBounties.length === 1 ? 'bounty' : 'bounties'} available`}
          </p>
        </div>
        <SubmitBountyDialog />
      </div>

      <div className="dock-wrapper flex justify-center my-6">
        <Dock 
          items={dockItems}
          panelHeight={60}
          baseItemSize={45}
          magnification={65}
        />
        <AnimatePresence>
          {sortOpen && (
            <motion.div
              ref={sortMenuRef}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="dock-dropdown"
              role="menu"
              aria-label="Sort options"
            >
              <div className="dock-dropdown-header">Sort by</div>
              <div>
                <button
                  className={`dock-dropdown-item ${sortBy === 'date' ? 'active' : ''}`}
                  onClick={() => { setSortBy('date'); setSortOpen(false); }}
                >
                  Date
                </button>
                <button
                  className={`dock-dropdown-item ${sortBy === 'reward' ? 'active' : ''}`}
                  onClick={() => { setSortBy('reward'); setSortOpen(false); }}
                >
                  Reward
                </button>
                <button
                  className={`dock-dropdown-item ${sortBy === 'reputation' ? 'active' : ''}`}
                  onClick={() => { setSortBy('reputation'); setSortOpen(false); }}
                >
                  Reputation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GlobalSpotlight gridRef={gridRef} />

      <div className="bounty-magic-grid bento-section" ref={gridRef}>
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading bounties...
          </div>
        ) : filteredBounties.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No bounties found. Create the first one!
          </div>
        ) : (
          sortedBounties.map((bounty) => (
            <ParticleCard
              key={bounty.id}
              className={`bounty-magic-card severity-${bounty.severity}`}
              onClick={() => router.push(`/bounty/${bounty.id}`)}
            >
              <div className="bounty-card__header">
                <div 
                  className={`bounty-card__label status-${bounty.status.replace(' ', '-')}`}
                >
                  {bounty.status.toUpperCase()}
                </div>
                <div 
                  className={`bounty-card__severity severity-${bounty.severity}`}
                >
                  {bounty.severity.toUpperCase()}
                </div>
              </div>
              <div className="bounty-card__content">
                <h2 className="bounty-card__title">{bounty.title}</h2>
                <p className="bounty-card__description">{bounty.description}</p>
                <div className="bounty-card__footer">
                  <div className="bounty-card__reward">💰 {bounty.reward}</div>
                  <div className="bounty-card__deadline">📅 {bounty.deadline}</div>
                </div>
                <div className="bounty-card__creator">👤 {bounty.creator}</div>
              </div>
            </ParticleCard>
          ))
        )}
      </div>
    </div>
  )
}
