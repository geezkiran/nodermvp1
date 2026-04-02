"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"

interface DockItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  disabled?: boolean
  isActive?: boolean
}

interface DockProps {
  className?: string
  items: DockItem[]
}

export default function Dock({ items, className }: DockProps) {
  const [active, setActive] = React.useState<string | null>(null)
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <div className={cn("flex items-center justify-center w-auto py-0", className)}>
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "flex items-end gap-4 px-4 py-3 rounded-3xl",
          "border border-white/10 bg-black/20 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        )}
      >
        <TooltipProvider delayDuration={100}>
          {items.map((item, i) => {
            const isActive = item.isActive !== undefined ? item.isActive : active === item.label
            const isHovered = hovered === i

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <motion.div
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    animate={{
                      scale: isHovered ? 1.2 : 1,
                      rotate: isHovered ? -5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex flex-col items-center"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={item.disabled}
                      className={cn(
                        "rounded-2xl relative text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-40",
                        "transition-colors",
                        isHovered && "shadow-lg shadow-white/10"
                      )}
                      onClick={() => {
                        if (item.isActive === undefined) {
                          setActive(item.label)
                        }
                        item.onClick?.()
                      }}
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6 transition-colors",
                          isActive ? "text-white" : "text-neutral-300"
                        )}
                      />
                      {/* Glowing ring effect */}
                      {isHovered && (
                        <motion.span
                          layoutId="glow"
                          className="absolute inset-0 rounded-2xl border border-white/20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </Button>


                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs border-white/10 bg-neutral-900 text-neutral-200">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </motion.div>
    </div>
  )
}
