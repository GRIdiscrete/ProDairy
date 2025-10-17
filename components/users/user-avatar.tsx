import React, { useEffect, useRef, useState } from "react"

interface UserAvatarProps {
  user: {
    id?: string
    first_name?: string
    last_name?: string
    email?: string
    department?: string
    role_name?: string
  } | null | undefined
  size?: "sm" | "md" | "lg"
  showName?: boolean
  showEmail?: boolean
  showDropdown?: boolean
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "md", showName = false, showEmail = false, showDropdown = false }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [open])

  const first = (user?.first_name || "").trim()
  const last = (user?.last_name || "").trim()
  const initials = (first.charAt(0) + (last.charAt(0) || "")).toUpperCase() || "UK"

  const sizeClasses = size === "sm" ? "w-8 h-8 text-sm" : size === "lg" ? "w-12 h-12 text-lg" : "w-10 h-10 text-base"

  return (
    <div className="flex items-center" ref={ref}>
      <button
        type="button"
        onClick={() => showDropdown ? setOpen((s) => !s) : undefined}
        className={`flex items-center gap-3 focus:outline-none`}
      >
        <div className={`rounded-full bg-red-600 flex items-center justify-center text-white font-semibold ${sizeClasses}`}>
          {initials}
        </div>

        {(showName || showEmail) && (
          <div className="text-left">
            {showName && <div className="text-sm font-medium text-gray-900">{(first || last) ? `${first} ${last}`.trim() : (user?.email || user?.id || "Unknown")}</div>}
            {showEmail && <div className="text-xs text-muted-foreground">{user?.email || "No email"}</div>}
          </div>
        )}
      </button>

      {open && showDropdown && (
        <div className="absolute z-30 mt-2 ml-2 w-64 bg-white border rounded-md shadow-lg p-3 text-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`rounded-full bg-red-600 flex items-center justify-center text-white font-semibold ${size === "lg" ? "w-12 h-12 text-lg" : "w-10 h-10 text-base"}`}>
              {initials}
            </div>
            <div>
              <div className="font-medium">{(first || last) ? `${first} ${last}`.trim() : "Unknown User"}</div>
              <div className="text-xs text-muted-foreground">{user?.role_name ?? user?.department ?? ""}</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mb-1">Email</div>
          <div className="text-sm mb-2 break-words">{user?.email ?? "No email"}</div>

          <div className="text-xs text-muted-foreground mb-1">Department</div>
          <div className="text-sm mb-2">{user?.department ?? "No department"}</div>

          <div className="text-xs text-muted-foreground mb-1">User ID</div>
          <div className="text-sm break-all">{user?.id ?? "N/A"}</div>
        </div>
      )}
    </div>
  )
}

export default UserAvatar
